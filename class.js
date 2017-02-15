var cid = getUrlParameter('cid');
var classInfo;

$(document).ready(function() {
	firebase.database().ref('classes/' + cid).on('value', function(snapshot) {
		classInfo = snapshot.val();
		if (classInfo == null) {
			$('.panel').hide();
			$('#no-class-panel').show();
		} else {
			$('.panel').hide();
			$('#class-info-panel h2').text(classInfo.name);
			$('#class-info-panel').show();
		}
	});
});

function onNotSignedIn() {
	window.location.replace("login.html?cid=" + cid);
}