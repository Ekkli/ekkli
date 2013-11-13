
Template.forgot_dialog.events({

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



var on_success = function(){
	Session.set("signupErrors", null);
	Session.set("loginErrors", null);
	if (Session.equals("whichMaps", 'participate')) {
		var map_id = Session.get('mapId');
    	var user_id = Meteor.user()._id;
    	Maps.update({_id:map_id},{$addToSet:{'participants':user_id}});
	}

}

