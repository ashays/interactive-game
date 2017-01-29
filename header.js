// Initialize Firebase
var config = {
  apiKey: "AIzaSyAqRXiVfJf9ILLUDq3oJHOVBuMjieD5oHM",
  authDomain: "interactive-game.firebaseapp.com",
  databaseURL: "https://interactive-game.firebaseio.com",
  storageBucket: "interactive-game.appspot.com",
  messagingSenderId: "37935877805"
};
firebase.initializeApp(config);

$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    $('#user-name').text(user.displayName);
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
			// An error happened.
		});
	})
});