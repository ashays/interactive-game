$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    console.log(user);
	    $('#user-name').text(user.displayName);
	  } else {
	  	console.log("error: no user signed in");
	    // No user is signed in.
	  }
	});
  var database = firebase.database();
  var gamesRef = firebase.database().ref('games/').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapShot) {
    	$('#games').append('<li onclick="gameSelected(event)" data-id = "' + childSnapShot.key + '" data-gametype= "' + childSnapShot.val().type + '">' + childSnapShot.val().name + '</li>');
    });
    $('#games-panel').show();
  });
});

function gameSelected(event) {
	var gameId = $(event.target).data().id;
	var gameType = $(event.target).data().gametype;
	console.log(gameId);
	console.log(gameType);
  $('#games-panel').hide();
  $('#thegame-panel').show();
  $('#almost-start-the-game').click(function() {
    $('#thegame-panel').hide();
    $('#thegames-panel').show();
    $("#startGameButton").click(function(event) {
     $("#thegames-panel").hide();
     $("#matchme-panel").show();
     startGame(gameId, gameType);
    });
  });
}

function startGame(gameid, gameType) {
	switch(gameType) {
		case "matching" :
			matchingGame(gameid);
			break;
		default:
			console.log("FUCCKKK");
	}
}

function matchingGame(gameid) {
	var words = {};
	var reversedWords = {};
	firebase.database().ref('games/' + gameid + '/questions/').once('value').then(function(snapshot) {
		snapshot.forEach(function(childSnapShot) {
			words[childSnapShot.key] = childSnapShot.val();
			reversedWords[childSnapShot.val()] = childSnapShot.key;
		});
	});
	var playersRef = firebase.database().ref('students/').once('value').then(function(snapshot) {
		counter = 0;
		key = true;
		keys = Object.keys(words);
		var studentMatches = {};
		//debugger;
		snapshot.forEach(function(childSnapShot) {
			if (key) {
				var input = keys[counter];
				studentMatches[childSnapShot.val().name] = [false, words[input]];
				firebase.database().ref('students/' + childSnapShot.key).update({word : input,});
				key = false;
			} else {
				
				var input = words[keys[counter]];
				studentMatches[childSnapShot.val().name] = [true, keys[counter]];
				firebase.database().ref('students/' + childSnapShot.key).update({word : input,});
				key = true;
				counter++;
			}
		});

    console.log(studentMatches);

		snapshot.forEach(function(childSnapShot) {
			if (studentMatches[childSnapShot.val().name][0]) {
				var dataStruct = reversedWords;
			} else {
				var dataStruct = words;
			}
			var names = Object.keys(studentMatches)
			for (i = 0; i < names.length; i++) {
				var name = names[i];
				console.log(name);
				//debugger;
				if (dataStruct[studentMatches[name][1]] && dataStruct[studentMatches[name][1]] == studentMatches[childSnapShot.val().name][1]) {
					firebase.database().ref('students/' + childSnapShot.key).update({matchedperson : name});
			          var thatPersonRef = firebase.database().ref('students/' + childSnapShot.key);
			          thatPersonRef.on('value', function(snapshot) {
			            // console.log(snapshot.val());
			            if (snapshot.val().iscorrect == true) {
                    $('#no-matches').hide();
			              studentMatches[name].push(true);
			              if (studentMatches[childSnapShot.val().name].length < 3) {
			                var theWord = "";
                      var theDef = ""
			                if (studentMatches[childSnapShot.val().name][0] == true) {
                        theWord = studentMatches[childSnapShot.val().name][1];
                        theDef = studentMatches[name][1];
			                } else {
                        theDef = studentMatches[childSnapShot.val().name][1];
                        theWord = studentMatches[name][1];
			                }
			                console.log(childSnapShot.val().name + " just correctly matched with " + name);
                      var listItemToAppend = '<li><span class="people">' + childSnapShot.val().name + ' and ' + name + '</span><span class="question">' + theWord + '</span><span class="answer">' + theDef + '</span></li>';
			                $('#matches').append(listItemToAppend);
			              }
			            }
			          });
					break;
				}
			}
		});
	});



}

//[Ashay : blue, Dhruv : Colour of Sky]
//[Ashay : (false, COS), Dhruv: (true, Blue)]