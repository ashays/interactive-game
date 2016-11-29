$(document).ready(function() {
  var database = firebase.database();
  var gamesRef = firebase.database().ref('games/').once('value').then(function(snapshot) {
    console.log(snapshot.val());
    for (i = 1; i < snapshot.val().length; i++) {
      $('#games').append("<li>" + snapshot.val()[i].name + "</li>")
    }
  });
});