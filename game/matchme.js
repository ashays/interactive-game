var team;
var correctMatch;
var theTimer;
var userRoundInfo;

$(document).ready(function() {
	$('#submit-answer').submit(function(e){
		e.preventDefault();
		var answer = $(e.target.answer).val().toLowerCase();
		if ($.inArray(answer, correctMatch) != -1) {
			console.log("correct");
			var match = {
				question: gameInfo.round[userData.uid].qNum,
				people: team.concat(correctMatch)
			};
			var updates = {};
			var allMatchedPeople = userRoundInfo.team.concat(userRoundInfo.match);
			for (i = 0; i < allMatchedPeople.length; i++) {
				updates['/games/' + gid + '/round/' + allMatchedPeople[i] + '/matched/'] = true;				
			}
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

function startGameOwner() {
	$('#restart-btn').show();
	$('#instructions-panel').show();
	showScoreboard();
	if (gameInfo.settings && gameInfo.settings.timer) {
		$('#timer-panel').show();
		if (! theTimer) {
			console.log("start timer");
			startTimer(Number(gameInfo.settings.timer) * 60);
		}
	}
}

function startGameStudent() {
	userRoundInfo = gameInfo.round[userData.uid];
	$('#instructions-panel').show();
	if (userRoundInfo) {
		correctMatch = [];
		userRoundInfo.match.forEach(function(item, index) {
			firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
				correctMatch.push(snapshot.val().toLowerCase());
			});
		});
		team = [];
		$('#team-members').hide();
		userRoundInfo.team.forEach(function(item, index) {
			firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
				team.push(snapshot.val().toLowerCase());
				if (gameInfo.settings && gameInfo.settings.collaborative) {
					updateAndShowTeam();
				}
			});
		});
		if (userRoundInfo.matched) {
			showScoreboard();
		} else {
			// Show prompt
			$('#prompt-panel img').remove();
			if (qSet.questions[userRoundInfo.qNum].image && userRoundInfo.type == "question") {
				$('#prompt-panel .prompt').before('<img src="' + qSet.questions[userRoundInfo.qNum].image + '">');
			}
			$('#prompt-panel .prompt').text(qSet.questions[userRoundInfo.qNum][userRoundInfo.type]);
			$('#prompt-panel').show();
		}
	} else {
		addAlert("Looks like you're sitting out this round. Pair up with a peer or just sit tight!", "help");
		showScoreboard();
	}
}

function updateAndShowTeam() {
	if (team.length == userRoundInfo.team.length && team.length > 1) {
		$('#team-members').show();
		$('#team-members').text("Your group: " + team.join(", "));
	}
}

function showScoreboard() {
	// Show scoreboard
	$('#scoreboard-panel').empty();
	if (gameInfo.scoreboard) {
		for (ind in gameInfo.scoreboard) {
			var allPeople = gameInfo.scoreboard[ind].people[0];
			for (i = 1; i < gameInfo.scoreboard[ind].people.length; i++) {
				allPeople +=  ' & ' + gameInfo.scoreboard[ind].people[i];
			}
			var imageCon = '';
			if (qSet.questions[Number(gameInfo.scoreboard[ind].question)].image) {
				imageCon = '<img src="' + qSet.questions[Number(gameInfo.scoreboard[ind].question)].image + '">';
			}
			if (qSet.questions[Number(gameInfo.scoreboard[ind].question)].type == "flashcard") {
				rankBlock = '<div class="question-block">' + imageCon + '<div class="answer">' + qSet.questions[Number(gameInfo.scoreboard[ind].question)].answer + '</div><div class="question">' + qSet.questions[Number(gameInfo.scoreboard[ind].question)].question + '</div><div class="people"><span>' + (Number(ind) + 1) + ' </span>' + allPeople + '</div></div>';				
			} else if (qSet.questions[Number(gameInfo.scoreboard[ind].question)].type == "simple") {
				rankBlock = '<div class="question-block">' + imageCon + '<div class="answer">' + qSet.questions[Number(gameInfo.scoreboard[ind].question)].question + '</div><div class="question">' + qSet.questions[Number(gameInfo.scoreboard[ind].question)].answer + '</div><div class="people"><span>' + (Number(ind) + 1) + ' </span>' + allPeople + '</div></div>';
			}
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

function setUpGame() {
	var updates = {};
	// Pair all participants and assign everyone a question or answer
	// TODO Odd number of participants? Currently just puts someone on standby
	// TODO make work when # questions < # participants
	// TODO make work if participants have same name
	// First, get all flashcard or simple questions from set and shuffle
	var allQuestions = qSet.questions;
	var questions = [];
	for (qNum in allQuestions) {
		if (allQuestions[qNum].type == "flashcard" || allQuestions[qNum].type == "simple") {
			var questionToAdd = allQuestions[qNum];
			questionToAdd.number = qNum;
			questions.push(questionToAdd);
		}
	}
	shuffle(questions);
	// Get all participants and shuffle
	var participants = gameInfo.participants;
	shuffle(participants);
	// Pair each participant with someone else
	var round = {};
	if (gameInfo.settings && gameInfo.settings.collaborative) {
		var numTeams = gameInfo.settings.collaborative;
		var groups = [];
		for (i = 0; i < numTeams; i++) {
			groups[i] = [];
		}
		for (j = 0; j < participants.length; j++) {
			groups[j % numTeams].push(participants[j]);
		}
		for (k = 0; k < participants.length; k++) {
			var yourGroup = k % numTeams;
			var theType = "question";
			var yourMatch = yourGroup + 1;
			if (yourGroup % 2 == 1) {
				theType = "answer";
				yourMatch = yourGroup - 1;
			}
			round[participants[k]] = {type: theType, qNum: Math.floor(yourGroup/2), team: groups[yourGroup], match: groups[yourMatch]};
		}
	} else {
		for (i = 0; i < participants.length - 1; i+=2) {
			var question = questions.pop();
			round[participants[i]] = {type: "question", team: [participants[i]], qNum: question.number, match: [participants[i+1]]};
			round[participants[i+1]] = {type: "answer", team: [participants[i+1]], qNum: question.number, match: [participants[i]]};
		}		
	}
	// Start game
	updates['/games/' + gid + '/scoreboard'] = [];
	updates['/games/' + gid + '/round'] = round;
	updates['/games/' + gid + '/status'] = "started";
	firebase.database().ref().update(updates).then(function() {
		console.log("game has started");
	}, function(error) {
		displayError(error.message);
	});
	// clearInterval(theTimer);
	// theTimer = undefined;
}

function restartGame() {
	setUpGame();
}

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