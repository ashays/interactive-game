$(document).ready(function() {
	$('#login').submit(function(e){
		e.preventDefault();
		var email = $(e.target.email).val();
		var password = $(e.target.password).val();
		firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
			window.location.href = "dash.html";
		}, function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			$('#login-error').text(errorMessage);
		});
	});

	$('#create-account').submit(function(e){
		e.preventDefault();
		// TODO password quality validation
		var email = $(e.target.email).val();
		var password = $(e.target.password).val();
		var name = $(e.target.name).val();
		firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
			var user = firebase.auth().currentUser;
			user.updateProfile({
				displayName: name
			}).then(function() {
				firebase.database().ref('users/' + user.uid).set({
				  name: name,
				  email: email
				}).then(function() {
					window.location.href = "dash.html";					
				});
			}, function(error) {
				// TODO error handling
				// An error happened.
			});
		}, function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  $('#create-account-error').text(errorMessage);
		});
	});

	$('#btn-create-account').click(function() {
		$('#login').hide();
		$('#create-account').show();
	});

	$('#btn-login').click(function() {
		$('#login').show();
		$('#create-account').hide();
	});
});
