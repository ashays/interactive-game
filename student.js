$(document).ready(function() {
    var database = firebase.database();
    var justSignedIn = false;
    $("#sign-in").submit(function(event) {
        firebase.auth().signInAnonymously().catch(function(error) {
          // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
          // ...
        });
        console.log(event.target);
        justSignedIn = true;
        event.preventDefault();
    });

    $("#submit-answer").submit(function(event) {
        event.preventDefault();
        if ($(event.target).attr('data-answer').toLowerCase() == $($(event.target).children('input')[0]).val().toLowerCase()) {
            $('#word-panel').hide();
            $('#status-panel h2').text("correct");
            $('#status-panel').show();
            $('body').attr('style', 'background-color: green');
            console.log("correct");
        } else {
            console.log("incorrect");
        }
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        // User is signed in.
        $('#login-panel').hide();
        $('#status-panel').show();
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        if (justSignedIn) {
            firebase.database().ref('students/' + uid).set({
                name: $('#name').val(),
                fact: $('#fact').val()
            });            
        }
        console.log(isAnonymous);
        console.log(uid);

        var myRef = firebase.database().ref('students/' + user.uid);
        myRef.on('value', function(snapshot) {
            if (snapshot.val().word && snapshot.val().matchedperson) {
                $('#status-panel').hide();
                $('#word-panel').show();
                $('#submit-answer').attr('data-answer', snapshot.val().matchedperson);
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