var gid = getUrlParameter('gid');
var gameInfo;
var qSet;

function onUserDataFunc() {
	// Get game info
	firebase.database().ref('games/' + gid).on('value', function(snapshot) {
		gameInfo = snapshot.val();
		// If game doesn't exist, user is not in class, or user is not in game, redirect to game.html
		if (gameInfo == null || gameInfo.status == "waiting" || $.inArray(gameInfo.class, [].concat(userData.classesIn).concat(userData.classesOwn)) == -1 || (gameInfo.owner != userData.uid && $.inArray(userData.uid, gameInfo.participants) == -1)) {
			// TODO also check if on correct page based on game type
			window.location.replace("../game.html?gid=" + gid);
		} else {
			firebase.database().ref('sets/' + gameInfo.set).once('value', function(snapshot) {
				$('.subhead .menu-btn').hide();
				$('#alert-panel').empty();
				$('.panel').hide();
				$('#game-info-panel h2').text(gameInfo.name);
				qSet = snapshot.val();
				if (gameInfo.owner == userData.uid) {
					// User is instructor/ admin of game
					if (gameInfo.status == "setup") {
						setUpGame();
					} else {
						startGameOwner();
					}
				} else {
					// User is student in class and participant in game
					if (gameInfo.status == "setup") {
						addAlert("Hold tight! The game is being initialized.", "help");
					} else {
						startGameStudent();
					}
				}
			});
		}
	});
}

function startGameOwner() {
	console.log("owner");
}

function startGameStudent() {
	console.log("student");
}

function setUpGame() {
	// Should be implemented by each respective game
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

function displayError(message) {
	addAlert(message, "error");
	console.error(message);
}

function onNotSignedIn() {
	window.location.replace("../game.html?gid=" + gid);
}