var qid = getUrlParameter('qid');
var setInfo;
var setRef = firebase.database().ref('sets/' + qid);

$(document).ready(function() {
	$('.add-question').click(addQuestion);
	$('#add-image').submit(function(e){
		e.preventDefault();
		var questionNum = $(e.target.qNum).val();
		var imgUrl = $(e.target.url).val();
		var updates = {};
		updates['/sets/' + qid + '/questions/' + questionNum + '/image/'] = imgUrl;
		firebase.database().ref().update(updates).then(function() {
			console.log('saved');
			$('.overlay-close').click();
		}, function(error) {
			$('#add-image .subt').text(error.message);
		});
	});
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
	var adminControls = '<div class="fancy-block-container"><div class="fancy-block-btn" title="Add Image" onclick="addImage(\'' + index + '\')"><i class="fa fa-image" aria-hidden="true"></i></div><div class="fancy-block-btn" title="Delete Question" onclick="deleteQuestion(\'' + index + '\')"><i class="fa fa-trash" aria-hidden="true"></i></div></div>';
	var imageEle = '';
	if (question.image) {
		imageEle = '<img src="' + question.image + '">';
	}
	if (question.type === "simple") {
		if (canEdit) {
			qBlockMarkup = '<div class="question-block admin" data-num="' + index + '">' + adminControls + imageEle + '<textarea class="answer" data-type="question">' + question.question + '</textarea><textarea class="question" data-type="answer">' + question.answer + '</textarea></div>';
		} else {
			qBlockMarkup = '<div class="question-block" data-num="' + index + '">' + imageEle + '<div class="answer" data-type="question">' + question.question + '</div><div class="question" data-type="answer">' + question.answer + '</div></div>';
		}
	} else if (question.type === "flashcard") {
		if (canEdit) {
			qBlockMarkup = '<div class="question-block admin" data-num="' + index + '">' + adminControls + imageEle + '<input class="answer" data-type="answer" type="text" value="' + question.answer + '"><textarea class="question" data-type="question">' + question.question + '</textarea></div>';
		} else {
			qBlockMarkup = '<div class="question-block" data-num="' + index + '">' + imageEle + '<input class="answer" data-type="answer" type="text" value="' + question.answer + '" readonly><div class="question" data-type="question">' + question.question + '</div></div>';
		}
	} else if (question.type === "open") {
		if (canEdit) {
			qBlockMarkup = '<div class="question-block admin" data-num="' + index + '">' + adminControls + imageEle + '<input class="answer" data-type="question" type="text" value="' + question.question + '"></div>';
		} else {
			qBlockMarkup = '<div class="question-block" data-num="' + index + '">' + imageEle + '<input class="answer" data-type="question" type="text" value="' + question.question + '" readonly></div>';
		}
	}
	$('#questions-panel').append(qBlockMarkup);
}

function addQuestion(event) {
	var type = $(event.target).parents('.add-question').attr('data-type');
	if (type==="flashcard") {
		var templateQuestion = {
			type: "flashcard",
			question: "Definition",
			answer: "Term"
		};
	} else if (type=="open") {
		var templateQuestion = {
			type: "open",
			question: "Open Ended Question"
		};
	} else {
		var templateQuestion = {
			type: "simple",
			question: "Question",
			answer: "Answer"
		};
	}
	var updates = {};
	if (setInfo.questions) {
		updates['/sets/' + qid + '/questions/' + setInfo.questions.length] = templateQuestion;
	} else {
		updates['/sets/' + qid + '/questions/'] = [templateQuestion];
	}
	firebase.database().ref().update(updates).then(function() {
		console.log('question added');
		$("html, body").animate({ scrollTop: $(document).height() }, 500);
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

function addImage(qNum) {
	$('#add-image input[name="url"]').val("");
	$('#add-image-qNum').val(qNum);
	$('#image-modal').show();
	$('.overlay').fadeIn();
}
