$(document).ready(function() {
	if (getUrlParameter("cid") == undefined) {
		$('#join-class').hide();
	}

	$('#login').submit(function(e){
		e.preventDefault();
		var email = $(e.target.email).val();
		var password = $(e.target.password).val();
		firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
			// TODO check if user has entry in users/ db? 
			onLogin(false);
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
					onLogin(true);
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

function onSignedIn() {
	console.log("user is signed in?");
	// window.location.replace("dash.html");
}

function onNotSignedIn() {
}

function onLogin(firstTime) {
	if (getUrlParameter("cid") == undefined) {
		if (firstTime) {
			window.location.href = "newclass.html";
		} else {
			window.location.href = "dash.html";
		}
	} else {
		window.location.href = "class.html?cid=" + getUrlParameter("cid");
	}
	
}