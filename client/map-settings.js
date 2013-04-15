
function createMap(name, is_public, description) {
	if (name) {
        Maps.insert({
            name: name,
			description: description,
            owner: Meteor.user()._id,
            participants: [],
            is_public: is_public,
			created_at: new Date(),
			last_update: new Date(),
			is_deleted: false
		});
		$("#close-map-settings-dialog-button").click();
	}
	else {
		alert("name cannot be empty");	
	}
}


Template.map_settings.helpers({
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

Template.map_settings.events({
  "click button#save-content": function(event) {
	event.preventDefault();
	var name = $("#edit-name-input").val();
	var description = $("#edit-description-input").val();
	var is_public = $("#edit-is-public-input").attr("checked") ? true : false;
    createMap(name, is_public, description);
  }
});





