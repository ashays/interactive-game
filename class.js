var cid = getUrlParameter('cid');
var classInfo;
var classRef = firebase.database().ref('classes/' + cid);

$(document).ready(function() {
	$('#requested-join-btn').hide();
	$('#join-class-btn').click(function() {
		var classReq = [userData.uid];
		if (classInfo.requests) {
			classReq = classInfo.requests;
			if ($.inArray(userData.uid, classReq) == -1) {
				classReq.push(userData.uid);
			}
		}
		classRef.update({'/requests/': classReq});
		$('#join-class-btn').hide();
		$('#requested-join-btn').show();
	});
});

function onUserDataFunc() {
	$('.panel').hide();
	$('.subhead .menu-btn').hide();
	// Get class info
	classRef.on('value', function(snapshot) {
		classInfo = snapshot.val();
		// If class doesn't exist
		if (classInfo == null) {
			$('#no-class-panel').show();
			$('header.subhead').hide();
		} else {
			$('#class-info-panel h2').text(classInfo.name);
			document.title = classInfo.name + " | ConnectEd";
			$('#alert-panel').empty();
			if (classInfo.owner == userData.uid) {
				$('#invite-btn').show();
				$('#new-game-btn').show();
				// Class join requests
				$('#requests-panel').hide();
				$('#requests-panel ul').empty();
				if (classInfo.requests) {
					classInfo.requests.forEach(function(item, index) {
						firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
							$('#requests-panel ul').append('<li onclick="approveJoin(\'' + item + '\', \'' + snapshot.val() + '\')" data-user="' + item + '">' + snapshot.val() + '<i class="fa fa-check-circle" aria-hidden="true"></i></li>');
						});
					});
					$('#requests-panel').show();
				}
			} else {
				$('#leave-btn').show();
			}
			// Check if person is in or owns class and we need to show join stuff
			if ($.inArray(cid, [].concat(userData.classesIn).concat(userData.classesOwn)) == -1) {
				console.log("invalid permissions");
				$('#not-in-class-panel').show();
				$('#leave-btn').hide();
			} else {
				$('#games-panel ul').empty();
				if (classInfo.currentGame) {
					firebase.database().ref('games/' + classInfo.currentGame + '/type').once('value', function(snapshot) {
						$('#games-panel ul').append('<li><a href="game.html?gid=' + classInfo.currentGame + '">' + snapshot.val() + '<span class="tag">In Progress <i class="fa fa-exclamation-triangle" aria-hidden="true"></i></span></a></li>');
					});
					$('#games-panel').show();
				} else {
					if (classInfo.owner == userData.uid) {
						addAlert("Get started by inviting your students to join this class. Then, creating and play a game to engage your students with the course material.", "help");
					}
				}
				if (classInfo.games) {
					classInfo.games.forEach(function(item, index) {
						firebase.database().ref('games/' + item + '/type').once('value', function(snapshot) {
							$('#games-panel ul').append('<li><a href="game.html?gid=' + item + '">' + snapshot.val() + '</a></li>');
						});
					});
				}
			}
		}
	});
}

function startGame() {
	if (! userData.mySets) {
		window.location.href = "newset.html";
		return;
	}
	var newGame = {
		type: "MatchMe",
		date: new Date().toJSON(),
		owner: userData.uid,
		class: cid,
		set: userData.mySets[0],
		status: "waiting"
	};
	var newGameKey = firebase.database().ref().child('games').push().key;
	if (classInfo.currentGame) {
		// TODO If there is a game in progress, end the game and start the new game
	}
	var updates = {};
	updates['/classes/' + cid + '/currentGame'] = newGameKey;
	updates['/games/' + newGameKey] = newGame;
	firebase.database().ref().update(updates).then(function() {
		window.location.href = "game.html?gid=" + newGameKey;
	}, function(error) {
		displayError(error.message);
	});
}

function onNotSignedIn() {
	window.location.replace("login.html?cid=" + cid);
}

function approveJoin(user, name) {
	console.log(user);
	if (classInfo.requests) {
		var classReq = classInfo.requests;
		classReq.splice($.inArray(user, classReq), 1);
		var updates = {};
		updates['/classes/' + cid + '/requests'] = classReq;
		// TODO User can't join multiple classes currently
		var listOfClasses;
		firebase.database().ref('users/' + user + '/classesIn').once('value', function(snapshot){
			listOfClasses = snapshot.val();
			if (listOfClasses) {
				updates['/users/' + user + '/classesIn/' + listOfClasses.length] = cid;					
			} else {
				updates['/users/' + user + '/classesIn/'] = [cid];
			}
			// TODO not currently error checking
			firebase.database().ref().update(updates).then(function() {
				$('#requests-panel .subt').text(name + " was successfully added to the class.");
			}, function(error) {
				displayError(error.message);
			});;
		});
	}
}

function addAlert(message, type) {
	if (type == "help") {
		$('#alert-panel').append('<div class="alert"><i class="fa fa-question-circle" aria-hidden="true"></i>' + message + '</div>');
	} else if (type == "error") {
		$('#alert-panel').append('<div class="alert error"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + message + '</div>');
		// TODO combine this add alert with game.js function
	}
	$('#alert-panel').show();
}


function inviteStudentsPrompt() {
	window.prompt("Share this link with your students!", window.location.href);
}

function leaveClass() {
	console.log("leaving class")
	if (userData.classesIn) {
		classesIn = userData.classesIn;
		classesIn.splice($.inArray(cid, classesIn), 1);
	}
	var updates = {};
	updates['/users/' + userData.uid + '/classesIn/'] = classesIn;
	// TODO not currently error checking
	return firebase.database().ref().update(updates);
}