
Template.map_settings.helpers({
    map_name: function() {
        var map = Maps.findOne({_id: Session.get("mapId")});
        if (map && map.name) {
            return map.name;
        }
        return "Untitled map";
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
    saveContent($("#edit-name-input").val(), $("#edit-description-input").val());
  }
});