var gid = getUrlParameter('gid');
var gameInfo;
var qSet;
var classInfo;
var userIDtoName = {};
var nameToUserID = {};
var theTimer;

$(document).ready(function() {
	$('#submit-answer').submit(function(e){
		e.preventDefault();
		var answer = $(e.target.answer).val().toLowerCase();

		var updates = {};
		if (gameInfo.submissions) {
			if (gameInfo.submissions[userRoundInfo.qNum]) {
				updates['/games/' + gid + '/submissions/' + userRoundInfo.qNum + '/' + gameInfo.submissions[userRoundInfo.qNum].length] = answer;
			} else {
				updates['/games/' + gid + '/submissions/' + userRoundInfo.qNum] = [answer];
			}
		} else {
			updates['/games/' + gid + '/submissions/' + userRoundInfo.qNum] = [answer];
		}
		firebase.database().ref().update(updates).then(function() {
			$($('#submit-answer input')[0]).val("");
			console.log("answer added");
		}, function(error) {
			displayError(error.message);
		});
	});
});

function startGameOwner() {
	if (! WordCloud.isSupported) {
		displayError("Unfortunately, Brain Dump is not supported on your browser.", "error");
	}
	$('#brain-dump-panel').show();
	// TODO Make current question show up
	// if (qSet) {
	// 	$('#brain-dump-question').text(qSet.questions[0].question);							
	// }
	// for (partIn in gameInfo.participants) {
	// 	gameInfo.submissions[gameInfo.current][gameInfo.participants[partIn]];							
	// }
	// WordCloud(document.getElementById('brain-dump'), {
	// 	list: [['stack', 12], ['queue', 6], ['priority queue', 3], ['linked list', 3]],
	// 	fontFamily: 'Montserrat, sans-serif',
	// 	gridSize: 20,
	// 	weightFactor: 10
	// });
	$('#brain-dump-panel').empty();
	for (qIndex in qSet.questions) {
		$('#brain-dump-panel').append('<h3>' + qSet.questions[qIndex].question + '</h3>')
		if (gameInfo.submissions && gameInfo.submissions[qIndex]) {
			// Append submissions to list
			var allSubs = '';
			for (i = 0; i < gameInfo.submissions[qIndex].length; i++) {
				allSubs += '<li>' + gameInfo.submissions[qIndex][i] + '</li>';
			}
			$('#brain-dump-panel').append('<ul>' + allSubs + '</ul>');
		} else {
			$('#brain-dump-panel').append('<p style="color: #7f8c8d">No submissions</p>');
		}
	}
	$('#instructions-panel').show();
	// if (gameInfo.settings && gameInfo.settings.timer) {
	// 	$('#timer-panel').show();
	// 	if (! theTimer) {
	// 		console.log("start timer");
	// 		startTimer(Number(gameInfo.settings.timer) * 60);
	// 	}
	// }
}

function startGameStudent() {
	userRoundInfo = gameInfo.round[userData.uid];
	if (userRoundInfo.qNum > 0) {
		$('#prev-question-btn').show();
	}
	if (userRoundInfo.qNum < qSet.questions.length - 1) {
		$('#next-question-btn').show();		
	}

	$('#instructions-panel').show();

	if (userRoundInfo) {
		$('#prompt-panel').show();
		$('#prompt-panel .prompt').text(qSet.questions[userRoundInfo.qNum].question);
	} else {
		addAlert("Looks like you're sitting out this round. Pair up with a peer or just sit tight!", "help");
	}
}

function nextQuestion() {
	var updates = {};
	updates['/games/' + gid + '/round/' + userData.uid] = {qNum: userRoundInfo.qNum + 1};
	firebase.database().ref().update(updates).then(function() {
		console.log("next question");
	}, function(error) {
		displayError(error.message);
	});
}

function prevQuestion() {
	var updates = {};
	updates['/games/' + gid + '/round/' + userData.uid] = {qNum: userRoundInfo.qNum - 1};
	firebase.database().ref().update(updates).then(function() {
		console.log("prev question");
	}, function(error) {
		displayError(error.message);
	});
}

function setUpGame() {
	var updates = {};


	// // First, get all flashcard or simple questions from set and shuffle
	// var allQuestions = qSet.questions;
	// var questions = [];
	// for (qNum in allQuestions) {
	// 	if (allQuestions[qNum].type == "flashcard" || allQuestions[qNum].type == "simple") {
	// 		var questionToAdd = allQuestions[qNum];
	// 		questionToAdd.number = qNum;
	// 		questions.push(questionToAdd);
	// 	}
	// }
	// shuffle(questions);
	// // Get all participants and shuffle
	var participants = gameInfo.participants;
	// shuffle(participants);
	// // Pair each participant with someone else
	var round = {};
	// if (gameInfo.settings && gameInfo.settings.collaborative) {
	// 	var numTeams = gameInfo.settings.collaborative;
	// 	var groups = [];
	// 	for (i = 0; i < numTeams; i++) {
	// 		groups[i] = [];
	// 	}
	// 	for (j = 0; j < participants.length; j++) {
	// 		groups[j % numTeams].push(participants[j]);
	// 	}
		for (k = 0; k < participants.length; k++) {
	// 		var yourGroup = k % numTeams;
	// 		var theType = "question";
	// 		var yourMatch = yourGroup + 1;
	// 		if (yourGroup % 2 == 1) {
	// 			theType = "answer";
	// 			yourMatch = yourGroup - 1;
	// 		}
			round[participants[k]] = {qNum: 0};
		}
	// } else {
	// 	for (i = 0; i < participants.length - 1; i+=2) {
	// 		var question = questions.pop();
	// 		round[participants[i]] = {type: "question", team: [participants[i]], qNum: question.number, match: [participants[i+1]]};
	// 		round[participants[i+1]] = {type: "answer", team: [participants[i+1]], qNum: question.number, match: [participants[i]]};
	// 	}
	// }
	// // Start game
	updates['/games/' + gid + '/submissions'] = [];
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

