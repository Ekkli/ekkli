
function createMap(name, is_public, description) {
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
    	if (name) {
		createMap(name, is_public, description);
		$("#edit-name-input").val("");
		$("#edit-description-input").val("");
		$("#edit-is-public-input").prop("checked", false);
	}
	else {
		alert("Discussion name cannot be empty");
	}
  }
});




