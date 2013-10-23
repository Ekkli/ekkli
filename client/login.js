
Template.login.events({

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

