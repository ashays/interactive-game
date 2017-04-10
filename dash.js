$(document).ready(function() {
});

function onUserDataFunc() {
	$('.panel').hide();
	if (! userData.classesOwn && ! userData.classesIn) {
		$('#no-classes-panel').show();
	} else {
		$('#classes-panel').show();
		$('#classes-panel ul').empty();
		$('#new-class-btn').hide();
		if (userData.classesOwn) {
			$('#new-class-btn').show();
			userData.classesOwn.forEach(function(item, index) {
				firebase.database().ref('classes/' + item + '/name').once('value', function(snapshot) {
					$('#classes-panel ul').append('<li><a href="class.html?cid=' + item + '">' + snapshot.val() + '<span class="tag">Instructor<i class="fa fa-user" aria-hidden="true"></i></span></a></li>');
				});
			});
		}
		if (userData.classesIn) {
			userData.classesIn.forEach(function(item, index) {
				firebase.database().ref('classes/' + item + '/name').once('value', function(snapshot) {
					$('#classes-panel ul').append('<li><a href="class.html?cid=' + item + '">' + snapshot.val() + '</a></li>');
				});
			});
		}
		if (userData.mySets) {
			$('#sets-panel').show();
			$('#sets-panel ul').empty();
			userData.mySets.forEach(function(item, index) {
				firebase.database().ref('sets/' + item + '/name').once('value', function(snapshot) {
					$('#sets-panel ul').append('<li><a href="set.html?qid=' + item + '">' + snapshot.val() + '</a></li>');
				});
			});			
		}
	}
}