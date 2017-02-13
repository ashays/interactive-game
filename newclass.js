$(document).ready(function() {
	$('#create-class').submit(function(e){
		e.preventDefault();
		var classname = $(e.target.name).val();
		createClass(classname).then(function() {
			// window.location.href = "class.html?c=" + ;
			window.location.href = "dash.html";
		}, function(error) {
			displayError(error.message);
		});;
	});
});

function createClass(classname) {
	var newClass = {
		name: classname,
		owner: userData.uid
	};
	var newClassKey = firebase.database().ref().child('classes').push().key;
	var classesOwn = [newClassKey]
	if (userData.classesOwn) {
		classesOwn = userData.classesOwn;
		classesOwn.push(newClassKey);
	}
	var updates = {};
	updates['/classes/' + newClassKey] = newClass;
	updates['/users/' + userData.uid + '/classesOwn/'] = classesOwn;
	return firebase.database().ref().update(updates);
}