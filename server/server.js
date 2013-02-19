
Meteor.publish("maps", function() {

    return Maps.find({$or: [
                        {"isPublic": true},
                        {owner: this.userId},
                        {participants: this.userId}]});
});

Meteor.publish("stories", function(mapId) {
    return Stories.find({
        mapId: mapId
    });
});