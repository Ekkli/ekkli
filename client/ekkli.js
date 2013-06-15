

Meteor.autosubscribe(function() {
	Meteor.subscribe("maps", Session.get("whichMaps"), function() { 
		Session.set("maps_loaded", true);
	});
    Meteor.subscribe("stories", Session.get("mapId"), function() {
		Session.set("stories_loaded", true);
	});
	Meteor.subscribe("opinions", Session.get("selectedStory"), function() {
		Session.set("opinions_loaded", true);
	});
});

Meteor.pages({
    '/':            {to: 'maps', as: 'root', nav: 'maps', before: [setMap]},
    '/maps':       {to: 'maps', as: 'maps', nav: 'maps', before: [setMap]},
    '/map/:_id':   {to: 'map', nav: 'map', before: [setMap]},
    '/map/:_id /:invited_user':   {to: 'map', nav: 'map', before: [signin,setMap]},

    '*' :   '404'
});

function signin(context) {
    if(!Meteor.user()){
        var _id = context.params._id;
        var invited_user_id = context.params.invited_user;
        var invited_user = Meteor.users.findOne({'_id':invited_user_id});

        if(invited_user.is_created){
            invited_user.emails[0].address;
            // go to login page
        }
        else{
            //go to sign in page and after this set user created flag  in invited users table

        }

    }
}

function setMap(context, page) {
    var _id = context.params._id;
    Session.set("mapId", _id);
    Session.set("selectedStory", null);
	Session.set("stories_loaded", false);
}

Template.layout.helpers({
    map: function () {
        map = Maps.findOne({_id: Session.get("mapId")});
		return map;
    }
});

Template.layout.events({
    "click button#addStoryBtn": function(e) {
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
	"click button#addLink": function(e) {
		e.preventDefault();
		if (Session.get("selectedStory")) {
			var story = Stories.findOne({_id: Session.get("selectedStory")});
			$("#addLink").popover({
				title: "Add link",
				content: "Click on the target story to create a link from the selected story",
				placement: "bottom"
			});
			$("#addLink").popover('show');
			Session.set("creating_link_from", story._id);
//			$("#vis").css('cursor', 'crosshair');
		}
		else {
			alert("You first need to select a story");
		}
	}
});



Meteor.startup(function() {
	Accounts.config({
		sendVerificationEmail: true
	});
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL'
	});
	if (!Session.get("whichMaps")) {
		if (amplify.store("whichMaps")) {
			Session.set("whichMaps", amplify.store("whichMaps"));
		}
	}
  //$(".editable").aloha();
});









