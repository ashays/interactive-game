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
					break;
				}
			}
		});
	});
}

//[Ashay : blue, Dhruv : Colour of Sky]
//[Ashay : (false, COS), Dhruv: (true, Blue)]