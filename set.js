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
			if (setInfo.owner == userData.uid) {
				// If user is owner of set, allow them to edit/ add questions
				for (qIndex in setInfo.questions) {
					addQuestionBlock(qIndex, setInfo.questions[qIndex], true);
				}
				// Auto-save each question when something changes
				$('.question-block input').change(autosaveQuestionEdit);
				$('.question-block textarea').change(autosaveQuestionEdit);
			} else {
				// If the user is not the owner, he or she can only view the questions
				$('#add-btn').hide();
				for (qIndex in setInfo.questions) {
					addQuestionBlock(qIndex, setInfo.questions[qIndex], false);
				}				
			}
			$('#questions-panel').show();
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
	window.location.replace("login.html?qid=" + qid);
}

function addQuestionBlock(index, question, canEdit) {
	var qBlockMarkup = "";
	if (question.type == "flashcard") {
		if (canEdit) {
			qBlockMarkup = '<div class="question-block admin" data-num="' + index + '"><div class="fancy-block-btn" title="Delete Question" onclick="deleteQuestion(\'' + index + '\')"><i class="fa fa-trash" aria-hidden="true"></i></div><input class="answer" data-type="answer" type="text" value="' + question.answer + '"><textarea class="question" data-type="question">' + question.question + '</textarea></div>';
		} else {
			qBlockMarkup = '<div class="question-block" data-num="' + index + '"><input class="answer" data-type="answer" type="text" value="' + question.answer + '" readonly><div class="question" data-type="question">' + question.question + '</div></div>';
		}
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
	if (setInfo.questions) {
		updates['/sets/' + qid + '/questions/' + setInfo.questions.length] = templateQuestion;
	} else {
		updates['/sets/' + qid + '/questions/'] = [templateQuestion];
	}
	firebase.database().ref().update(updates).then(function() {
		console.log('question added');
	}, function(error) {
		displayError(error.message);
	});
}

function deleteQuestion(qNum) {
	var questions = setInfo.questions;
	if (qNum < questions.length) {
		questions.splice(qNum, 1);
		var updates = {};
		updates['/sets/' + qid + '/questions/'] = questions;
		firebase.database().ref().update(updates).then(function() {
			console.log('question deleted');
		}, function(error) {
			displayError(error.message);
		});		
	}
}