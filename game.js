var gid = getUrlParameter('gid');
var gameInfo;
var qSet;
var classInfo;
var participantInfo = {};

$(document).ready(function() {
	$('#submit-answer').submit(function(e){
		e.preventDefault();
		var answer = $(e.target.answer).val().toLowerCase();
		if (gameInfo.round[answer] == gameInfo.round[userData.uid].answer) {
			console.log("correct");
		} else {
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
				} else if (gameInfo.status == "started") {
					// Show scoreboard
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
						// Show prompt
						$('#prompt-panel .prompt').text(gameInfo.round[userData.uid].prompt);
						$('#prompt-panel').show();
					}
				}
			}
			if (gameInfo.status == "waiting") {
				// Show game participants
				if (gameInfo.participants) {
					$('#participants-panel ul').empty();
					gameInfo.participants.forEach(function(item, index) {
						firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
							participantInfo[item] = snapshot.val();
							$('#participants-panel ul').append('<li>' + snapshot.val() + '</li>');
						});
					});
					$('#participants-panel').show();
				}
			} else if (gameInfo.status == "started") {
				if (gameInfo.participants) {
					gameInfo.participants.forEach(function(item, index) {
						firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
							participantInfo[snapshot.val().toLowerCase()] = item;
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
		$('#game-info-panel h2').text(classInfo.name + " " + qSet.name);
	} else if (classInfo) {
		$('#game-info-panel h2').text(classInfo.name);
	} else {
		$('#game-info-panel h2').text(qSet.name);
	}
}

function startGame() {
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
		round[participantInfo[participants[i]].toLowerCase()] = question.number;
		round[participants[i+1]] = {prompt: question.answer, answer: question.number};
		round[participantInfo[participants[i+1]].toLowerCase()] = question.number;
	}
	var updates = {};
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