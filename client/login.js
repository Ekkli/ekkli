Template.login.helpers({
	show_signup_with_email: function() {
		if (Session.equals("showing_signup_with_email", true)) {
			return "block";
		}
		return "none";
	},
	login_errors: function() {
		return Session.get("loginErrors");
	},
	signup_errors: function() {
		return Session.get("signupErrors");
	}
});

Template.login.events({
    'click button#login-user' : function () {
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();

		if (!username) {
			return on_login({
				reason: "You must fill a username"
			});
		}
		if (!password) {
			return on_login({
				reason: "You must fill a password"
			});
		}
		console.log("logging in");
        Meteor.loginWithPassword(username, password, on_login);
        return false;

    },
    'click button#signup-user' : function () {
        event.preventDefault();
        var username = $("#s_username").val();
        var password = $("#s_password").val();
        var email = $("#s_email").val();
		var error = null;
		
		// TODO add validation functions using Meteor.validateNewuser
		
		if (!username) {
			return on_sign_up({
				reason: "You must fill a username"
			});
		}
		if (error = validateUsername(username)) {
			return on_sign_up({
				reason: error
			});
		}
		if (!password) {
			return on_sign_up({
				reason: "You must fill a password"
			});
		}
		if (error = validatePassword(password)) {
			return on_sign_up({
				reason: error
			});
		}
		if (!email) {
			return on_sign_up({
				reason: "You must fill an email"
			});
		}
		if (error = validateEmail(email)) {
			return on_sign_up({
				reason: error
			});
		}

        var options = {
            username: username,
            password: password,
            email: email
        };
		console.log("creating user");
        Accounts.createUser(options, on_sign_up);
        return false;
    },
	'click #signup_with_email': function() {
		Session.set("showing_signup_with_email", !Session.get("showing_signup_with_email"));
	},
	'click #sign-up-google': function() {
		Meteor.loginWithGoogle({}, on_sign_up);
	},
    'click #sign-up-facebook': function() {
        Meteor.loginWithFacebook({}, on_sign_up);
    },
    'click #sign-up-github': function() {
        Meteor.loginWithGithub({}, on_sign_up);
    },
    'click #sign-up-twitter': function() {
        Meteor.loginWithTwitter({}, on_sign_up);
    },
	'click #forgot-password': function() {
		var email = $("#username").val();
		if (validateEmail(email)) {
			email = prompt("What's your email address?", "");
		}
		if (email) {
			Accounts.forgotPassword({
				email: email
			}, function(err) {
				if (err) {
					alert(err);
				} 
				else {
					alert("Check your email inbox..");
				}
			});
		}
	}

});

var on_login = function(error) {
	console.log("on login");
	console.log(error);
    if (error){
        Session.set("loginErrors", error.reason);
        return;
    }
	on_success();
}

var on_sign_up = function(error) {
	console.log("on sign up");
	console.log(error);
    if (error) {
        Session.set("signupErrors", error.reason);
        return;
    }
	on_success();
}

var on_success = function(){
	Session.set("signupErrors", null);
	Session.set("loginErrors", null);
	if (Session.equals("whichMaps", 'participate')) {
		var map_id = Session.get('mapId');
    	var user_id = Meteor.user()._id;
    	Maps.update({_id:map_id},{$addToSet:{'participants':user_id}});
	}
}

