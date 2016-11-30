$(document).ready(function() {
    var database = firebase.database();

    $("#sign-in").submit(function(event) {
        firebase.auth().signInAnonymously().catch(function(error) {
          // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
          // ...
        });
        console.log(event.target);
        event.preventDefault();
    });
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        firebase.database().ref('students/' + uid).set({
            name: $('#name').val(),
            fact: $('#fact').val()
        });
        console.log(isAnonymous);
        console.log(uid);
        // ...
        } else {
        // User is signed out.
        // ...
        }
        // ...
    });
    $("#sign-out").click(function(event) {
        firebase.auth().signOut().then(function() {
            console.log('Signed Out');
        }, function(error) {
            console.error('Sign Out Error', error);
        });
    });
});