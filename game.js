var gid = getUrlParameter('gid');
var gameInfo;
var qSet;
var classInfo;
var userIDtoName = {};
var nameToUserID = {};
var theTimer;

$(document).ready(function() {
	$('#settings-use-timer').change(updateTimer);
	$('#settings-timer').change(updateTimer);
	$('#submit-answer').submit(function(e){
		e.preventDefault();
		var answer = $(e.target.answer).val().toLowerCase();
		if (gameInfo.round[answer] == gameInfo.round[userData.uid].answer) {
			console.log("correct");
			var match = {
				question: qSet.questions[gameInfo.round[userData.uid].answer].question,
				answer: qSet.questions[gameInfo.round[userData.uid].answer].answer,
				people: [answer, userData.name]
			};
			var updates = {};
			updates['/games/' + gid + '/round/' + userData.uid + '/matched/'] = true;
			updates['/games/' + gid + '/round/' + nameToUserID[answer] + '/matched/'] = true;
			if (gameInfo.scoreboard) {
				updates['/games/' + gid + '/scoreboard/' + gameInfo.scoreboard.length] = match;
			} else {
				updates['/games/' + gid + '/scoreboard/'] = [match];
			}
			firebase.database().ref().update(updates).then(function() {
				console.log("match made");
			}, function(error) {
				displayError(error.message);
			});
		} else {
			$('#submit-answer .error').text("You matched with the wrong person! Try again");
			console.log("incorrect");
		}
	});
});

function onUserDataFunc() {
	// Get game info
	firebase.database().ref('games/' + gid).on('value', function(snapshot) {
		gameInfo = snapshot.val();
		// If game doesn't exist
		if (gameInfo == null || $.inArray(gameInfo.class, [].concat(userData.classesIn).concat(userData.classesOwn)) == -1) {
			$('#error-panel').show();
			$('header.subhead').hide();
		} else {
			$('.subhead .menu-btn').hide();
			$('.panel').hide();
			if (gameInfo.owner == userData.uid) {
				// User is instructor/ admin of game
				console.log("owner");
				if (gameInfo.status == "waiting") {
					$('#start-btn').show();
					$('#settings-panel').show();
					// Settings panel
					$('#question-sets').empty();
					userData.mySets.forEach(function(item, index) {
						firebase.database().ref('sets/' + item + '/name').once('value', function(snapshot) {
							if (gameInfo.set == item) {
								$('#question-sets').append('<li onclick="updateSet(\'' + item + '\')" class="selected">' + snapshot.val() + '</li>');
							} else {
								$('#question-sets').append('<li onclick="updateSet(\'' + item + '\')">' + snapshot.val() + '</li>');
							}
						});
					});
				} else if (gameInfo.status == "started") {
					$('#restart-btn').show();
					showScoreboard();
					$('#timer-panel').show();
					if (! theTimer) {
						console.log("start timer");
						startTimer(Number(gameInfo.settings.timer) * 60);						
					}
				}
			} else {
				// User is student in class and has permission to participant in game
				console.log("student");
				if ($.inArray(userData.uid, gameInfo.participants) == -1) {
					// User has not joined game
					$('#join-btn').show();
				} else {
					// User has joined game
					if (gameInfo.status == "started") {
						if (gameInfo.round[userData.uid].matched) {
							showScoreboard();
						} else {
							// Show prompt
							$('#prompt-panel .prompt').text(gameInfo.round[userData.uid].prompt);
							$('#prompt-panel').show();							
						}
					}
				}
			}
			if (gameInfo.status == "waiting") {
				// Show game participants
				if (gameInfo.participants) {
					$('#participants-panel ul').empty();
					gameInfo.participants.forEach(function(item, index) {
						firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
							userIDtoName[item] = snapshot.val();
							$('#participants-panel ul').append('<li>' + snapshot.val() + '</li>');
						});
					});
					$('#participants-panel').show();
				}
			} else if (gameInfo.status == "started") {
				$('#instructions-panel').show();
				if (gameInfo.participants) {
					gameInfo.participants.forEach(function(item, index) {
						firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
							userIDtoName[item] = snapshot.val();
							nameToUserID[snapshot.val().toLowerCase()] = item;
						});
					});
				}
			}
			// Get class info
			firebase.database().ref('classes/' + gameInfo.class).on('value', function(snapshot) {
				classInfo = snapshot.val();
				updateHeader();
			});
			// Get question set info
			firebase.database().ref('sets/' + gameInfo.set).on('value', function(snapshot) {
				qSet = snapshot.val();
				updateHeader();
			});
		}
	});
}

function showScoreboard() {
	// Show scoreboard
	$('#scoreboard-panel').empty();
	if (gameInfo.scoreboard) {
		for (ind in gameInfo.scoreboard) {
			rankBlock = '<div class="question-block"><div class="answer">' + gameInfo.scoreboard[ind].answer + '</div><div class="question">' + gameInfo.scoreboard[ind].question + '</div><div class="people"><span>' + (Number(ind) + 1) + ' </span>' + gameInfo.scoreboard[ind].people[0] + ' & ' + gameInfo.scoreboard[ind].people[1] + '</div></div>';
			$('#scoreboard-panel').append(rankBlock);
		}
	}
	$('#scoreboard-panel').show();
}

function startTimer(duration) {
	// TODO pause game when timer ends
    var start = Date.now(),
        diff,
        minutes,
        seconds;
    function timer() {
        // get the number of seconds that have elapsed since 
        // startTimer() was called
        diff = duration - (((Date.now() - start) / 1000) | 0);

        // does the same job as parseInt truncates the float
        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        $('#timer-panel').text(minutes + ":" + seconds);

        if (diff <= 0) {
            // add one second so that the count down starts at the full duration
            // example 05:00 not 04:59
            start = Date.now() + 1000;
        }
    };
    // we don't want to wait a full second before the timer starts
    timer();
    theTimer = setInterval(timer, 1000);
}

function updateSet(qid) {
	var updates = {};
	updates['/games/' + gid + '/set'] = qid;
	firebase.database().ref().update(updates).then(function() {
		console.log("set updated");
	}, function(error) {
		displayError(error.message);
	});
}

function updateTimer() {
	var updates = {};
	if ($('#settings-use-timer').is(':checked')) {
		updates['/games/' + gid + '/settings/timer'] = $('#settings-timer').val();
	} else {
		updates['/games/' + gid + '/settings/timer'] = null;
	}
	firebase.database().ref().update(updates).then(function() {
		console.log("timer updated");
	}, function(error) {
		displayError(error.message);
	});
}

function joinGame() {
	// Add user to game's list of participants
	var updates = {};
	if (gameInfo.participants) {
		updates['/games/' + gid + '/participants/' + gameInfo.participants.length] = userData.uid;		
	} else {
		updates['/games/' + gid + '/participants/'] = [userData.uid];		
	}
	firebase.database().ref().update(updates).then(function() {
		console.log('joined game');
	}, function(error) {
		displayError(error.message);
	});
}

function updateHeader() {
	if (classInfo && qSet) {
		$('#game-info-panel h2').text(classInfo.name + ": " + qSet.name);
	} else if (classInfo) {
		$('#game-info-panel h2').text(classInfo.name);
	} else {
		$('#game-info-panel h2').text(qSet.name);
	}
}

function startGame() {
	// TODO fix timer glitchiness
	clearInterval(theTimer);
	theTimer = undefined;
	// Pair all participants and assign everyone a question or answer
	var questions = qSet.questions;
	for (qNum in questions) {
		questions[qNum].number = qNum;
	}
	shuffle(questions);
	console.log(questions);
	// TODO filter so only flashcard questions
	var participants = gameInfo.participants;
	shuffle(participants);
	var round = {};
	// TODO make work for odd numbers of participants
	// TODO make work when # questions < # participants
	// TODO make work if participants have same name
	for (i = 0; i < participants.length - 1; i+=2) {
		var question = questions.pop();
		round[participants[i]] = {prompt: question.question, answer: question.number};
		round[userIDtoName[participants[i]].toLowerCase()] = question.number;
		round[participants[i+1]] = {prompt: question.answer, answer: question.number};
		round[userIDtoName[participants[i+1]].toLowerCase()] = question.number;
	}
	var updates = {};
	updates['/games/' + gid + '/scoreboard'] = [];
	updates['/games/' + gid + '/round'] = round;
	updates['/games/' + gid + '/status'] = "started";
	firebase.database().ref().update(updates).then(function() {
		console.log("game has started");
	}, function(error) {
		displayError(error.message);
	});
}

// function onNotSignedIn() {
// 	window.location.replace("login.html?cid=" + cid);
// }

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}