$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
	  	var user = firebase.auth().currentUser;
		var name, email;

		if (user != null) {
		  name = user.displayName;
		  email = user.email;
		}
		var userNameFlag = false;
		var emailFlag = false;
		var passwordFlag = false;
		$("#users-name").text(name);
		$("#users-email").text(email);
		console.log(user.displayName);
		$("#changeUserName").click(function(){
			$("#users-name").hide();
			$("#users-email").show();
			$("#updatedName").show();
			$("#updatedEmail").hide();
			$("#cancelProfileUpdateButton").show();
			$("#updateProfileInformationButton").show();
			$("#changePasswordButton").hide();
			userNameFlag = true;
		});
		$("#changeEmailId").click(function(){
			$("#users-email").hide();
			$("#updatedName").hide();
			$("#users-name").show();
			$("#updatedEmail").show();
			$("#cancelProfileUpdateButton").show();
			$("#updateProfileInformationButton").show();
			$("#changePasswordButton").hide();
			emailFlag = true;
		});
		$("#changePasswordButton").click(function() {
			$("#changeUserName").hide();
			$("#changeEmailId").hide();
			$("#change-password-field").show();
			$("#cancelProfileUpdateButton").show();
			$("#updateProfileInformationButton").show();
			$("#changePasswordButton").hide();
			passwordFlag = true;
		});
		$("#cancelProfileUpdateButton").click(cancelButton);

		$("#updateProfileInformationButton").click(function() {
			if (userNameFlag) {
				var updatedName = $("#updatedName").val();
				$("#users-name").text(updatedName);
				user.updateProfile({
					displayName: updatedName
				}).then(function() {
				  // Update successful.
				}, function(error) {
				  // An error happened.
				});
				userNameFlag = false;
			}
			if (emailFlag) {
				var updatedEmail = $("#updatedEmail").val();
				user.updateEmail(updatedEmail).then(function() {
				  	// Update successful.
					$("#users-email").text(updatedEmail);
				}, function(error) {
				  // An error happened.
				});
				emailFlag = false;
			}
			if (passwordFlag) {
				var newPassword = $("#newPassword").val();
				user.updatePassword(newPassword).then(function() {
				  // Update successful.
				}, function(error) {
				  // An error happened.
				});
				passwordFlag = false;
			}
			cancelButton()
		});
	});
	
});

function cancelButton() {
	$("#users-name").show();
	$("#users-email").show();
	$("#updatedName").hide();
	$("#updatedEmail").hide();
	$("#cancelProfileUpdateButton").hide();
	$("#updateProfileInformationButton").hide();
	$("#changePasswordButton").show();
	$("#changeUserName").show();
	$("#changeEmailId").show();
	$("#change-password-field").hide();
	var userNameFlag = false;
	var emailFlag = false;
	var passwordFlag = false;

}