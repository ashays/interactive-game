$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
	  	var user = firebase.auth().currentUser;
		var name, email;

		if (user != null) {
		  name = user.displayName;
		  email = user.email;
		}
		$("#users-name").text(name);
		$("#users-email").text(email);
		console.log(user.displayName);
		$("#changeUserName").click(function(){
			$("#users-name").hide()
			$("#updatedName").show()
			$("#cancelProfileUpdateButton").show()
			$("#updateProfileInformationButton").show()
			$("#changePasswordButton").hide()
		});
	});
	
});