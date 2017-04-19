var gid = getUrlParameter('gid');
var gameInfo;
var qSet;
var classInfo;

$(document).ready(function() {
	$('#settings-use-timer').change(updateTimer);
	$('#settings-timer').change(updateTimer);
	$('#settings-collaborative').change(collaborativeMode);
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
			$('#alert-panel').empty();
			$('.panel').hide();
			if (gameInfo.status == "waiting") {
				// Show game participants
				$('#participants-panel ul').empty();
				if (gameInfo.participants) {
					$('#participants-panel h3').text('Game Participants');
					gameInfo.participants.forEach(function(item, index) {
						firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
							$('#participants-panel ul').append('<li>' + snapshot.val() + '</li>');
						});
					});
				} else {
					$('#participants-panel h3').text('No Game Participants');
				}
				$('#participants-panel').show();
				if (gameInfo.owner == userData.uid) {
					// User is instructor/ admin of game
					$('#start-btn').show();
					addAlert("A new game has been created! Adjust the game settings below and instruct your students to join the game on their devices.", "help");
					// Settings panel
					$('#settings-panel').show();
					// List of question sets to choose from
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
					// Select appropriate game type
					$('#game-type li').removeClass("selected");
					$('#game-type [data-name="' + gameInfo.type + '"]').addClass("selected");
				} else {
					// User is student in class and has permission to participant in game
					if ($.inArray(userData.uid, gameInfo.participants) == -1) {
						// User has not joined game
						$('#join-btn').show();
						addAlert("Your instructor has created a game. Tap 'Join Game' above to participate.", "help");
					} else {
						// User has joined game
						addAlert("Waiting for more students to join. The game will begin on your instructor's mark.", "help");
					}
				}
			} else {
				// Game has begun
				if (gameInfo.owner == userData.uid || $.inArray(userData.uid, gameInfo.participants) != -1) {
					if (gameInfo.type == "MatchMe") {
						window.location.replace("game/matchme.html?gid=" + gid);
					}
				} else {
					// User has not joined game
					$('#join-btn').show();
					addAlert("Your instructor has created a game, and the game has already begun. Tap 'Join Game' above to participate.", "help");
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

function addAlert(message, type) {
	if (type == "help") {
		$('#alert-panel').append('<div class="alert"><i class="fa fa-question-circle" aria-hidden="true"></i>' + message + '</div>');
	} else if (type == "error") {
		$('#alert-panel').append('<div class="alert error"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + message + '</div>');
		// TODO remove error alerts after x seconds
		// setTimeout(function() {
		//   $("#the-tag-you-want-to-remove").remove();
		// }, 5000);
	}
	$('#alert-panel').show();
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

function collaborativeMode() {
	var updates = {};
	if ($('#settings-collaborative').is(':checked')) {
		updates['/games/' + gid + '/settings/collaborative'] = 4;
	} else {
		updates['/games/' + gid + '/settings/collaborative'] = null;
	}
	firebase.database().ref().update(updates).then(function() {
		console.log("collaborative mode updated");
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

function displayError(message) {
	addAlert(message, "error");
	console.error(message);
}

function startGame() {
	var updates = {};
	if (gameInfo.settings && gameInfo.settings.collaborative && (!gameInfo.participants || gameInfo.participants.length < gameInfo.settings.collaborative)) {
		displayError("There must be at least " + gameInfo.settings.collaborative + " participants to use collaborative mode.");
		return;		
	}
	if (gameInfo.type == "MatchMe") {
		// Must be at least 2 participants
		if (!gameInfo.participants || gameInfo.participants.length < 2) {
			displayError("There must be at least two participants to begin this game.");
			return;
		}
	} else if (gameInfo.type == "Brain Dump") {
		// updates['/games/' + gid + '/current'] = 0;
		// updates['/games/' + gid + '/submissions'] = [];
	} else {
		// Invalid game type
		displayError("Please select a valid game!");
		return;
	}
	updates['/games/' + gid + '/name'] = classInfo.name + ": " + qSet.name;
	updates['/games/' + gid + '/status'] = "setup";
	firebase.database().ref().update(updates).then(function() {
		console.log("game has started");
	}, function(error) {
		displayError(error.message);
	});
}

// function onNotSignedIn() {
// 	window.location.replace("login.html?cid=" + cid);
// }