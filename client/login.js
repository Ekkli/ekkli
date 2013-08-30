Template.login.helpers({
	show_signup_with_email: function() {
		if (Session.equals("showing_signup_with_email", true)) {
			return "block";
		}
		return "none";
	}
});

Template.login.events({
    'click button#login-user' : function () {
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();

        if (username && password) {
            Meteor.loginWithPassword(username, password,on_success);
        }
        else {
            alert("Fields could not be empty");
        }

        return false;

    },
    'click button#signup-user' : function () {
        event.preventDefault();
        var username = $("#s_username").val();
        var password = $("#s_password").val();
        var email = $("#s_email").val();


        var options = {
            username: username,
            password: password,
            email:email
        };
        Accounts.createUser(options,on_success);
        return false;

    },
	'click #signup_with_email': function() {
		Session.set("showing_signup_with_email", !Session.get("showing_signup_with_email"));
	}

});

var on_success = function(error){
    if (error){
        alert(error);
        return;
    }
    var map_id = Session.get('mapId');
    var user_id = Meteor.user()._id;
    Maps.update({_id:map_id},{$addToSet:{'participants':user_id}});
    Session.set("whichMaps",'participate');
}

