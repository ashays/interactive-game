$(document).ready(function() {

});

function onUserDataFunc() {
	$('.panel').hide();
	if (! userData.classesOwn && ! userData.classesIn) {
		$('#no-classes-panel').show();
	} else {
		if (userData.classesOwn) {
			$('#my-classes-panel').show();
			$('#my-classes-panel ul').empty();
			userData.classesOwn.forEach(function(item, index) {
				firebase.database().ref('classes/' + item + '/name').once('value', function(snapshot) {
					$('#my-classes-panel ul').append('<li><a href="class.html?cid=' + item + '">' + snapshot.val() + '</a></li>');
				});
			});
		}
		if (userData.classesIn) {
			$('#classes-panel').show();
			$('#classes-panel ul').empty();
			userData.classesIn.forEach(function(item, index) {
				firebase.database().ref('classes/' + item + '/name').once('value', function(snapshot) {
					$('#classes-panel ul').append('<li><a href="class.html?cid=' + item + '">' + snapshot.val() + '</a></li>');
				});
			});
		}
	}
}