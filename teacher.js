$(document).ready(function() {
  $("#startGameButton").hide();
  var database = firebase.database();
  var gamesRef = firebase.database().ref('games/').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapShot) {
    	$('#games').append('<li onclick="gameSelected(event)" data-id = "' + childSnapShot.key + '" data-gametype= "' + childSnapShot.val().type + '">' + childSnapShot.val().name + '</li>');
    });  
  });
});

function gameSelected(event) {
	var gameId = $(event.target).data().id;
	var gameType = $(event.target).data().gametype;
	console.log(gameId);
	console.log(gameType);
	$("#startGameButton").show();
	$("#startGameButton").click(function(event) {
		$("#games").hide();
		$("#startGameButton").hide();
		startGame(gameId, gameType);
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
			for (var name in studentMatches) {
				console.log(name);
				if (dataStruct[studentMatches[name][1]]) {
					firebase.database().ref('students/' + childSnapShot.key).update({matchedperson : name});
          var thatPersonRef = firebase.database().ref('students/' + childSnapShot.key);
          thatPersonRef.on('value', function(snapshot) {
            // console.log(snapshot.val());
            if (snapshot.val().iscorrect == true) {
              studentMatches[name].push(true);
              if (studentMatches[childSnapShot.val().name].length < 3) {
                var theMatch = "";
                if (studentMatches[childSnapShot.val().name][0] == true) {
                  theMatch = studentMatches[childSnapShot.val().name][1] + " ---> " + studentMatches[name][1];
                } else {
                  theMatch = studentMatches[name][1] + " ---> " + studentMatches[childSnapShot.val().name][1];
                }
                console.log(childSnapShot.val().name + " just correctly matched with " + name);
                $('#matches').append('<li>' + theMatch + '</li>')                
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