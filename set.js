var qid = getUrlParameter('qid');
var setInfo;
var setRef = firebase.database().ref('sets/' + qid);

$(document).ready(function() {
});

function onUserDataFunc() {
	$('.panel').hide();
	// Get set info
	setRef.on('value', function(snapshot) {
		setInfo = snapshot.val();
		if (setInfo == null) {
			// If set doesn't exist
			$('#no-set-panel').show();
			$('header.subhead').hide();
		} else {
			$('#class-info-panel h2').text(setInfo.name);
			document.title = setInfo.name + " | ConnectEd";
			// Fill the page with the questions of the set
			$('#questions-panel').empty();
			for (qIndex in setInfo.questions) {
				addQuestionBlock(qIndex, setInfo.questions[qIndex]);
			}
			// Auto-save each question when something changes
			$('.question-block input').change(autosaveQuestionEdit);
			$('.question-block textarea').change(autosaveQuestionEdit);

			$('#questions-panel').show();
			if (setInfo.owner == userData.uid) {
				// If user is owner of set, allow them to edit/ add questions
				// TODO
			} else {
				// Not the owner! What happens? Can't edit! Can view?
				// TODO
			}
		}
	});
}

function autosaveQuestionEdit(event) {
	var qType = $(event.target).attr('data-type');
	var qNum = $(event.target).parents('.question-block').attr('data-num');
	var value = event.target.value;
	var updates = {};
	updates['/sets/' + qid + '/questions/' + qNum + '/' + qType + '/'] = value;
	firebase.database().ref().update(updates).then(function() {
		console.log('saved');
	}, function(error) {
		displayError(error.message);
	});
}

function onNotSignedIn() {
	// Can users who aren't signed in see contents of a question set?
	// window.location.replace("login.html?cid=" + cid);
}

function addQuestionBlock(index, question) {
	var qBlockMarkup = "";
	if (question.type == "flashcard") {
		qBlockMarkup = '<div class="question-block" data-num="' + index + '"><input class="answer" data-type="answer" type="text" value="' + question.answer + '"><textarea class="question" data-type="question">' + question.question + '</textarea></div>';
	}
	$('#questions-panel').append(qBlockMarkup);
}

function addQuestion() {
	var templateQuestion = {
		type: "flashcard",
		question: "Definition",
		answer: "Term"
	};
	var updates = {};
	updates['/sets/' + qid + '/questions/' + setInfo.questions.length] = templateQuestion;
	firebase.database().ref().update(updates).then(function() {
		console.log('question added');
	}, function(error) {
		displayError(error.message);
	});
}