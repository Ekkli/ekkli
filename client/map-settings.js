
createMap=function (name, is_public, description, callback) {
	var  new_map = {
            	name: name,
				description: description,
            	owner: Meteor.user()._id,
            	participants: [],
            	is_public: is_public,
				created_at: new Date(),
				last_update: new Date(),
				is_deleted: false
			};
			_.each(_.keys(STORY_TYPES), function(key) {
				new_map["count_" + key] = 0;
				_.each(_.keys(STORY_TYPES[key].lifecycle), function(status_key) {
					new_map["count_" + key + "_" + status_key] = 0;
				})
			})
			
			Maps.insert(new_map, 
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
			if (callback) 
				callback();
		
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
		createMap(name, is_public, description, function() {
			$("#map-settings-dialog").modal('hide');
			$("#edit-name-input").val("");
			$("#edit-description-input").val("");
			$("#edit-is-public-input").prop("checked", false);
			
		});
	}
	else {
		alert("Map name cannot be empty");
	}
  }
});





