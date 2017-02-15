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
	    onSignedIn(user);
	    var userRef = firebase.database().ref('users/' + user.uid);
	    userRef.on('value', function(snapshot) {
	      userData = snapshot.val();
	      userData['uid'] = user.uid;
	      onUserDataFunc();
	    });
	  } else {
	  	// No user is signed in.
	  	onNotSignedIn();
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

function onSignedIn(user) {
	$('#user-name').text(user.displayName);	
}

function onNotSignedIn() {
	console.log("error: no user signed in");
	window.location.replace("index.html");
}

function onUserDataFunc() {
	console.log(userData);
}

function displayError(message) {
	alert(message);
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};