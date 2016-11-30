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
        $('#login-panel').hide();
        $('#status-panel').show();
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        firebase.database().ref('students/' + uid).set({
            name: $('#name').val(),
            fact: $('#fact').val()
        });
        console.log(isAnonymous);
        console.log(uid);

        var myRef = firebase.database().ref('students/' + user.uid);
        myRef.on('value', function(snapshot) {
            if (snapshot.val().word) {
                $('#status-panel').hide();
                $('#word-panel').show();
                $('.word').text(snapshot.val().word);
            }
            console.log(snapshot.val());
        });

        // ...
        } else {
            $('#login-panel').show();
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

function signOut() {
    firebase.auth().signOut().then(function() {
        console.log('Signed Out');
    }, function(error) {
        console.error('Sign Out Error', error);
    });    
}