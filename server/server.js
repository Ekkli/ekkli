
Meteor.publish("maps", function() {
    return Maps.find();
});

Meteor.publish("stories", function(mapId) {
    return Stories.find({
        mapId: mapId
    });
});