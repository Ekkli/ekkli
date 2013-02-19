
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

        Maps.insert({
            name: mapName,
            owner: Meteor.user()._id,
            participants: [],
            isPublic: isPublic,
        });
    }
});


Template.mapListItem.events({
    "click a": function(e) {
        e.preventDefault();
        Meteor.go(Meteor.mapPath({_id: this._id}), null);
    }
});
