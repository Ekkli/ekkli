
Template.maps.helpers({
   maps: function() {
       return Maps.find({});
   }
});

Template.maps.events({
    "click button#addNewMap": function(e) {
        e.preventDefault();
        var mapName = $("#newMapName").val();
        var isPublic = $("#newMapIsPublic").attr("checked") ? true : false;
		createMap(mapName, isPublic, "");
    }
});


Template.mapListItem.events({
    "click a": function(e) {
        e.preventDefault();
        Meteor.go(Meteor.mapPath({_id: this._id}), null);
    }
});
