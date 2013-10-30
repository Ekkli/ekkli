
Template.invite_users.helpers({
    map_name: function() {
        var map = Maps.findOne({_id: Session.get("dialog_map_id")});
        if (map && map.name) {
            return map.name;
        }
        return "";
    },
    map_is_public: function() {
        var map = Maps.findOne({_id: Session.get("dialog_map_id")});
        if (map) {
            return map.is_public;
        }
        return "";
    },
    map_description: function() {
        var map = Maps.findOne({_id: Session.get("dialog_map_id")});
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
            Meteor.call('sendInvitation', emails, msg, (Session.get("dialog_map_id")!=null)?Session.get("dialog_map_id")
                :Session.get("mapId"));
            $("#close-invite-user-dialog-button").click();
        }
        else {
            alert("Email address could not be empty");
        }
        return false;

    }
});





