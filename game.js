var gid = getUrlParameter('gid');
var gameInfo;
var qSet;
var classInfo;

$(document).ready(function() {
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
			if (gameInfo.owner == userData.uid) {
				// User is instructor/ admin of game
				console.log("owner");
				$('#start-btn').show();
			} else {
				// User is student in class and has permission to participate in game
				console.log("student");
				if ($.inArray(userData.uid, gameInfo.participants) == -1) {
					// User has not joined game
					$('#join-btn').show();
				} else {
					// User has joined game
				}
			}
			// Show game participants
			if (gameInfo.participants) {
				$('#participants-panel ul').empty();
				gameInfo.participants.forEach(function(item, index) {
					firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
						$('#participants-panel ul').append('<li>' + snapshot.val() + '</li>');
					});
				});
				$('#participants-panel').show();
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
	shuffle(questions);
	for (qNum in questions) {
		var question = questions[qNum];
		console.log(question);
	}
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