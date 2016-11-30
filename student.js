var uid;

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

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        // User is signed in.
        $('#login-panel').hide();
        $('#waiting-panel').show();
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
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
            $('#username').text(snapshot.val().name);
            if (snapshot.val().word && snapshot.val().matchedperson) {
                $('#waiting-panel').hide();
                $('#word-panel').show();
                $('#submit-answer').attr('data-answer', snapshot.val().matchedperson);
                $('.word').text(snapshot.val().word);
            }
            console.log(snapshot.val());
        });

        $("#submit-answer").submit(function(event) {
            event.preventDefault();
            if ($(event.target).attr('data-answer').toLowerCase() == $($(event.target).children('input')[0]).val().toLowerCase()) {
                $('#word-panel').hide();
                $('#correct-panel').show();
                $('body').addClass('correct');
                firebase.database().ref('students/' + uid).update({
                    iscorrect: true
                });
                console.log("correct");
            } else {
                alert('Incorrect! Please try again');
                console.log("incorrect");
            }
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
        firebase.database().ref('students/' + uid).set({});
    }, function(error) {
        console.error('Sign Out Error', error);
    });    
}