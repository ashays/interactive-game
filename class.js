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
	// Get class info
	classRef.on('value', function(snapshot) {
		classInfo = snapshot.val();
		if (classInfo == null) {
			$('#no-class-panel').show();
			$('#leave-btn').hide();
		} else {
			$('#class-info-panel h2').text(classInfo.name);
			document.title = classInfo.name + " | ConnectEd";
			if (classInfo.owner == userData.uid) {
				$('#invite-btn').show();
				$('#leave-btn').hide();
			} else {
				$('#invite-btn').hide();
			}
			$('#class-info-panel').show();
			if (classInfo.owner == userData.uid && classInfo.requests) {
				$('#requests-panel ul').empty();
				classInfo.requests.forEach(function(item, index) {
					firebase.database().ref('users/' + item + '/name').once('value', function(snapshot) {
						$('#requests-panel ul').append('<li onclick="approveJoin(\'' + item + '\')" data-user="' + item + '">' + snapshot.val() + '<i class="fa fa-check-circle" aria-hidden="true"></i></li>');
					});
				});
				$('#requests-panel').show();
			}
		}
	});
	// TODO 
	// Check if person is in or owns class
	if (userData.classesOwn) {
		if ($.inArray(cid, userData.classesOwn.concat(userData.classesIn)) == -1) {
			console.log("invalid permissions");
			$('#not-in-class-panel').show();
			$('#leave-btn').hide();
		}		
	} else {
		if ($.inArray(cid, userData.classesIn) == -1) {
			console.log("invalid permissions");
			$('#not-in-class-panel').show();
			$('#leave-btn').hide();
		}
	}
}

function onNotSignedIn() {
	window.location.replace("login.html?cid=" + cid);
}

function approveJoin(user) {
	console.log(user);
	if (classInfo.requests) {
		var classReq = classInfo.requests;
		classReq.splice($.inArray(user, classReq), 1);
		var updates = {};
		updates['/classes/' + cid + '/requests'] = classReq;
		// TODO User can't join multiple classes currently
		updates['/users/' + user + '/classesIn/'] = [cid];
		return firebase.database().ref().update(updates);
	}
}

function inviteStudentsPrompt() {
	window.prompt("Share this link with your students!", window.location.href);
}

function leaveClass() {
	if (userData.classesIn) {
		classesIn = userData.classesIn;
		classesIn.splice($.inArray(cid, classesIn), 1);
	}
	var ref = '/users/' + userData.uid + '/classesIn/';
	return firebase.database().ref().update({ref: classesIn});
}