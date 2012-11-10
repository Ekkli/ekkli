
EkkliRouter = Backbone.Router.extend({
    routes: {
        "": "maps",
        "map/:mapId": "map"
    },
    maps: function() {
        Session.set("page", "maps");
        Session.set("map", "");
        return this.navigate("", true);
    },
    map: function(mapId) {
        Session.set("page", "map");
        Session.set("mapId", mapId);
        return this.navigate("map/" + mapId);
    }
});

Router = new EkkliRouter();

Meteor.startup(function() {
    return Backbone.history.start({pushState: true});
});

Template.content.currentPage = function(page) {
    return Session.equals("page", page);
};
