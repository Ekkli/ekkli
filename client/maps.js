
Template.mapsView.helpers({
   maps: function() {
       return Maps.find({});
   }
});

Template.mapsView.events({
    "click button#addNewMap": function(e) {
        e.preventDefault();
        var mapName = $("#newMapName").val();
        Maps.insert({
            name: mapName,
        });
    }
});


Template.mapListItem.events({
    "click a": function(e) {
        e.preventDefault();
        Router.map(this._id);
    }
});
