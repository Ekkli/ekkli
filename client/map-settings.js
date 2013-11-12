
createOrUpdateMap=function (map, name, is_public, description, contextId, callback) {
    if(map){

        map.name = name;
        map.is_public = is_public;
        map.description = description;
        Maps.update({_id:map._id}, map);
    }
    else{
        var  new_map = {
                    name: name,
                    description: description,
                    owner: Meteor.user()._id,
                    ownerName: getCurrentUserName(),
                    ownerEmail: getCurrentUserEmail(),
                    ownerPicture: getCurrentUserPicture(),
					contextId: contextId,
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
        }

        if (callback)
            callback();
		
}


Template.map_settings.helpers({
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

Template.map_settings.events({
  "click button#save-content": function(event) {
	event.preventDefault();
	var name = $("#edit-name-input").val();
	var description = $("#edit-description-input").val();
	var is_public = $("#edit-is-public-input").attr("checked") ? true : false;
    if (name) {
        var map = Maps.findOne({_id: Session.get("dialog_map_id")});
		createOrUpdateMap(map,name, is_public, description, Session.get("contextId"), function() {
			$("#map-settings-dialog").modal('hide');
			$("#edit-name-input").val("");
			$("#edit-description-input").val("");
			$("#edit-is-public-input").prop("checked", false);
            Session.set("dialog_map_id",null);
		});
	}
	else {
		alert("Map name cannot be empty");
	}
  },
    "click button#close-map-settings-dialog-button": function(event) {
        event.preventDefault();
        Session.set("dialog_map_id",null);
    }

});





