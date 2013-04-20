

Meteor.autosubscribe(function() {
	Meteor.subscribe("maps", Session.get("whichMaps"), function() { 
		Session.set("maps_loaded", true);
	});
    Meteor.subscribe("stories", Session.get("mapId"), function() {
		Session.set("stories_loaded", true);
	});
});

Meteor.pages({
    '/':            {to: 'maps', as: 'root', nav: 'maps', before: [setMap]},
    '/maps':       {to: 'maps', as: 'maps', nav: 'maps', before: [setMap]},
    '/map/:_id':   {to: 'map', nav: 'map', before: [setMap]},
    '*' :   '404'
});

function setMap(context, page) {
    var _id = context.params._id;
    Session.set("mapId", _id);
	Session.set("stories_loaded", false);
    Session.set("selectedStory", null);
}

Template.layout.helpers({
    map: function () {
        return Maps.findOne({_id: Session.get("mapId")});
    }
});

Template.layout.events({
    "click button#addStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "Story", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#addSubStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "SubStory", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#clear": function(e) {
        e.preventDefault();
        Stories.remove({
            mapId: Session.get("mapId")
        });
        Session.set("selectedStory","");
    },
});

Meteor.startup(function() {
	Accounts.config({
		sendVerificationEmail: true
	});
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL'
	});
	if (!Session.get("whichMaps")) {
		Session.set("whichMaps", "mine");
	}
  //$(".editable").aloha();
});







