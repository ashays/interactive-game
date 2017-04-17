// Initialize Firebase
if (document.location.host) {
  // remote file over http or https
  // setup production Firebase and FullStory
  var config = {
    apiKey: "AIzaSyCtgJleRxdf5sf7Xh9yqM88a7UdOPre1FQ",
    authDomain: "connected-dca61.firebaseapp.com",
    databaseURL: "https://connected-dca61.firebaseio.com",
    projectId: "connected-dca61",
    storageBucket: "connected-dca61.appspot.com",
    messagingSenderId: "863683517919"
  };
  window['_fs_debug'] = false;
  window['_fs_host'] = 'www.fullstory.com';
  window['_fs_org'] = '42ZR0';
  window['_fs_namespace'] = 'FS';
  (function(m,n,e,t,l,o,g,y){
      if (e in m && m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].'); return;}
      g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
      o=n.createElement(t);o.async=1;o.src='https://'+_fs_host+'/s/fs.js';
      y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
      g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)};
      g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
      g.clearUserCookie=function(c,d,i){if(!c || document.cookie.match('fs_uid=[`;`]*`[`;`]*`[`;`]*`')){
      d=n.domain;while(1){n.cookie='fs_uid=;domain='+d+
      ';path=/;expires='+new Date(0).toUTCString();i=d.indexOf('.');if(i<0)break;d=d.slice(i+1)}}};
  })(window,document,window['_fs_namespace'],'script','user');
} else {
  // local file, use dev Firebase
  var config = {
    apiKey: "AIzaSyAqRXiVfJf9ILLUDq3oJHOVBuMjieD5oHM",
    authDomain: "interactive-game.firebaseapp.com",
    databaseURL: "https://interactive-game.firebaseio.com",
    storageBucket: "interactive-game.appspot.com",
    messagingSenderId: "37935877805"
  };
}
firebase.initializeApp(config);

var userData;

$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    onSignedIn(user);
	    var userRef = firebase.database().ref('users/' + user.uid);
	    userRef.on('value', function(snapshot) {
	      userData = snapshot.val();
	      userData['uid'] = user.uid;
	      FS.identify(user.uid, {
	        displayName: userData.name,
	        email: userData.email,
	      });
	      onUserDataFunc();
	    });
	  } else {
	  	// No user is signed in.
	  	onNotSignedIn();
	  }
	});

	$('#btn-logout').click(function() {
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			window.location.href = "index.html";
		}, function(error) {
			displayError(error.message);
		});
	})

	$('.overlay-close').click(function() {
		$('.overlay').fadeOut({
			complete: function() { $('.modal').hide(); }
		});
	});
});

function onSignedIn(user) {
	$('#user-name').text(user.displayName);	
}

function onNotSignedIn() {
	console.log("error: no user signed in");
	window.location.replace("index.html");
}

function onUserDataFunc() {
	console.log(userData);
}

function displayError(message) {
	alert(message);
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};