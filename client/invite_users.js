/*
createOrUpdateMap=function (null,name, is_public, description) {
        		Maps.insert({
            		name: name,
				description: description,
            		owner: Meteor.user()._id,
            		participants: [],
            		is_public: is_public,
				created_at: new Date(),
				last_update: new Date(),
				is_deleted: false
			}, 
			function(error, map_id) {
				if (error) {
					alert(JSON.stringify(error));
				}
				else {
					$("#close-map-settings-dialog-button").click();
					Meteor.go(Meteor.mapPath({_id: map_id}), null);	
				}
			}
			);
		
}
*/

Template.invite_users.helpers({
    map_name: function() {
        var map = Maps.findOne({_id: Session.get("mapId")});
        if (map && map.name) {
            return map.name;
        }
        return "";
    },
    map_is_public: function() {
        var map = Maps.findOne({_id: Session.get("mapId")});
        if (map) {
            return map.is_public;
        }
        return "";
    },
    map_description: function() {
        var map = Maps.findOne({_id: Session.get("mapId")});
        if (map && map.description) {
            return map.description;
        }
        return "";
    }
});





Template.invite_users.events({
    'click button#invite-users' : function () {
        event.preventDefault();
		Session.set("invited_collaborators_done", true);
        var emails = $("#email-address").val();
        var msg = $("#msg-input").val();

        if (emails) {
            Meteor.call('sendInvitation', emails, msg, Session.get("mapId"));
            $("#close-invite-user-dialog-button").click();
        }
        else {
            alert("Email address could not be empty");
        }
        return false;

    }
});





