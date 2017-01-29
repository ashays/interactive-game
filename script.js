$(document).ready(function() {
	$('#create-account').submit(function(e){
		e.preventDefault();
		console.log("create-account");
		// TODO password quality validation
		var email = $(e.target.email).val();
		var password = $(e.target.password).val();
		var name = $(e.target.name).val();
		firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
			var user = firebase.auth().currentUser;
			user.updateProfile({
				displayName: name
			}).then(function() {
				window.location.href = "teacher.html";
			}, function(error) {
				// TODO error handling
				// An error happened.
			});
		}, function(error) {
		  // TODO - if error, show user error
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		});
	});
});
