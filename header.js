// Initialize Firebase
var config = {
  apiKey: "AIzaSyAqRXiVfJf9ILLUDq3oJHOVBuMjieD5oHM",
  authDomain: "interactive-game.firebaseapp.com",
  databaseURL: "https://interactive-game.firebaseio.com",
  storageBucket: "interactive-game.appspot.com",
  messagingSenderId: "37935877805"
};
firebase.initializeApp(config);

var userData;

$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    $('#user-name').text(user.displayName);
	    var userRef = firebase.database().ref('users/' + user.uid);
	    userRef.on('value', function(snapshot) {
	      userData = snapshot.val();
	      userData['uid'] = user.uid;
	      onUserDataFunc();
	    });
	  } else {
	  	console.log("error: no user signed in");
	  	window.location.replace("index.html");
	    // No user is signed in.
	  }
	});

	$('#btn-logout').click(function() {
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			window.location.href = "index.html";
		}, function(error) {
			displayError(error.message);
		});
	})
});

function onUserDataFunc() {
	console.log(userData);
}

function displayError(message) {
	alert(message);
}