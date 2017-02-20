var cid = getUrlParameter('cid');
var classInfo;
var classRef = firebase.database().ref('classes/' + cid);

$(document).ready(function() {
	classRef.on('value', function(snapshot) {
		classInfo = snapshot.val();
		if (classInfo == null) {
			$('.panel').hide();
			$('#no-class-panel').show();
		} else {
			$('.panel').hide();
			$('#class-info-panel h2').text(classInfo.name);
			document.title = classInfo.name + " | ConnectEd";
			// Check if person is in or owns class
			$('#class-info-panel').show();
		}
	});

	$('#join-class-btn').click(function() {
		var classReq = [userData.uid];
		if (classInfo.requests) {
			classReq = classInfo.requests;
			classReq.push(userData.uid);
		}
		classRef.update({'/requests/': classReq});
	});
});

function onUserDataFunc() {
	if ($.inArray(cid, userData.classesOwn.concat(userData.classesIn)) == -1) {
		console.log("invalid permissions");
		$('#not-in-class-panel').show();
	}
}

function onNotSignedIn() {
	window.location.replace("login.html?cid=" + cid);
}


function createClass(classname) {
	var newClass = {
		name: classname,
		owner: userData.uid
	};
	var newClassKey = firebase.database().ref().child('classes').push().key;
	var classesOwn = [newClassKey]
	if (userData.classesOwn) {
		classesOwn = userData.classesOwn;
		classesOwn.push(newClassKey);
	}
	var updates = {};
	updates['/classes/' + newClassKey] = newClass;
	updates['/users/' + userData.uid + '/classesOwn/'] = classesOwn;
	return firebase.database().ref().update(updates);
}