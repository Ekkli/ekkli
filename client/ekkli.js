
Meteor.subscribe("maps");

Meteor.autosubscribe(function() {
    Meteor.subscribe("stories", Session.get("mapId"));
});