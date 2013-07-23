

Meteor.autosubscribe(function() {
	Meteor.subscribe("maps", Session.get("whichMaps"), function() { 
		Session.set("maps_loaded", true);
		initDashboardTutorial();
	});
    Meteor.subscribe("stories", Session.get("mapId"), function() {
		Session.set("stories_loaded", true);
		initMapTutorial();
	});
	Meteor.subscribe("opinions", Session.get("selectedStory"), function() {
		Session.set("opinions_loaded", true);
		initMapTutorial();
	});
    Meteor.subscribe("invited_user", Session.get('invited_user_id'));

	Meteor.subscribe("userData");
});



Meteor.pages({
    '/':            {to: 'maps', as: 'root', nav: 'maps', before: [setMap, initDashboardTutorial]},
    '/maps':       {to: 'maps', as: 'maps', nav: 'maps', before: [setMap, initDashboardTutorial]},
    '/map/:_id':   {to: 'map', nav: 'map', before: [setMap, initMapTutorial]},
    '/map/:_id/user_id/:invited_user':   {to: 'map', nav: 'accept_invitation', before: [login,setMap, initMapTutorial]},

    '*' :   '404'
});

function login() {

    if(Meteor.user()){
        this.template('map');
        this.done();
    }
    else{
        var invited_user_id = this.params.invited_user;
        Session.set('invited_user_id',invited_user_id);
//        var invited_user = InvitedUsers.findOne({_id:invited_user_id});
//        alert(invited_user);
//        if(invited_user){
//            var user_email = invited_user.emails[0].address;
//            this.set('email',user_email);
//        }
        this.template('login');
    }
}

function setMap(context, page) {

    var _id = context.params._id;
    Session.set("mapId", _id);
    Session.set("selectedStory", null);
	Session.set("stories_loaded", false);
}

function initDashboardTutorial(context, page) {
	if (userNeedsTutorial("MASTERS_BASICS")) {
		if (!userAchieved("created_map")) {
			showTutorialTip("created_map", "#createMap", "Start here!", "Click here to create a new map", "#createMap");
			return;
		}
	}
}

function initMapTutorial(context, page) {
	console.log("Initializing map tutorial");
	if (userNeedsTutorial("MASTERS_BASICS")) {
		if (!userAchieved("created_action")) {
			showTutorialTip("created_action", "#addSubStory", "Map creation", "Click here to add a new action to the map", "#addSubStory");
			return;
		}
		// Not working :(
		// if (!userAchieved("edited_story_title")) {
		// 	showTutorialTip("edited_story_title", "#edit-title-input", "Map creation", "Edit the action content here. Click Save or press Enter when you're done.", "#save-story-title");
		// 	return;
		// }
		if (!userAchieved("created_another_action")) {
			showTutorialTip("created_another_action", "#addSubStory", "Map creation", "Now, click again to create a 2nd action", "#addSubStory");
			return;
		}
		// Not working :(
		// if (!userAchieved("advanced_status")) {
		// 	showTutorialTip("advanced_status", "#next-status-action", "Map creation", "Click here to change the action status", "#next-status-action");
		// 	return;
		// }
		if (!userAchieved("created_result")) {
			showTutorialTip("created_result", "#addStory", "Map creation", "Click here to create a result expected after these actions", "#addStory");
			return;
		}
		if (!userAchieved("selected_previous_story")) {
			showTutorialTip("selected_previous_story", "#vis", "Map creation", "Click on the 1st action to select it", "#vis", "top");
			return;
		}		
		if (!userAchieved("created_fork")) {
			showTutorialTip("created_fork", "#addSubStory", "Map creation", "Now, click here to fork into alternative path", "#addSubStory");
			return;
		}
		if (!userAchieved("created_link")) {
			showTutorialTip("created_link", "#addLink", "Map creation", "Finally, let's create a link to the result. Click here to start linking, and then click on the result", "#addLink");
			return;
		}
	}
	
}

function showTutorialTip(achievement, domSelector, title, tip, elementToListenTo, placement) {
	// show tooltip
	console.log("showing tip at " + domSelector + ": " + tip);
	if (!placement) placement = "bottom";
	console.log($(domSelector));
	$(domSelector).popover({
		title: title,
		content: tip,
		animation: true,
		placement: placement
	});
	$(domSelector).popover('show');
	// register event handler that will add the achievement
	$(elementToListenTo).one("click", function() {
		Meteor.call("addUserAchievement", achievement);
		console.log("Achievement " + achievement + " unlocked");
	});
}


Template.layout.helpers({
    map: function () {
        map = Maps.findOne({_id: Session.get("mapId")});
		return map;
    }
});

Template.layout.events({
    "click button#addStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "RESULT", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#addSubStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "ACTION", Session.get("selectedStory"));
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
				content: "Click on a target to create a link from the selected element",
				placement: "bottom"
			});
			$("#addLink").popover('show');
			Session.set("creating_link_from", story._id);
//			$("#vis").css('cursor', 'crosshair');
		}
		else {
			alert("You first need to select some element");
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
	svgPanFactory($);
  //$(".editabl).aloha();
});









