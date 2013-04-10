
Meteor.subscribe("maps");

Meteor.autosubscribe(function() {
    Meteor.subscribe("stories", Session.get("mapId"));
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
    Session.set("selectedStory", null);
}

Template.layout.helpers({
    map: function () {
        return Maps.findOne({_id: Session.get("mapId")});
    },
    no_story_selected: function() {
        var story_id = Session.get("selectedStory");
        if (story_id) {
            var story = Stories.findOne({_id: story_id});
            if (story && Session.equals("mapId", story.mapId)) {
                return false;
            }
        }
        return true;
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
    "click button#viewContent": function(e) {
      alert("view content");
      e.preventDefault();
      $("#content-dialog").modal("toggle");
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
		sendVerificationEmail: true,
		forbidClientAccountCreation: true
	});
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL'
	});
  //$(".editable").aloha();
});
