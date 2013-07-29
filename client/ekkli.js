

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


function welcome() {
    if(Meteor.user()){
        this.template('map');
        this.done();
    }

}


function login() {

    if(Meteor.user()){
        this.template('welcome');

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
	if (userNeedsTutorial("MASTERS_BASICS") && !Session.get("dont_show_tutorial")) {
		
		if (!Session.get("basics_tutorial_initialized")) {
			initBasicsTutorial("dashboard");
		}
		
		var achievement = "created_map";
		if (!checkConditions(achievement)) return;
		if (!userAchieved(achievement)) {
			showTutorialTip(achievement, "#createMap", "Start here!", "Click here to create a new map");
			return;
		}
	}
}

function initMapTutorial(context, page) {
	// return;
	
	console.log("Initializing map tutorial");
	//var owner = Session.get("mapOwner");
	// if (owner) { 
	// 	if (owner !== Meteor.user()._id) return;	// don't show tutorial if it's not your map) {
	// }
	if (userNeedsTutorial("MASTERS_BASICS") && !Session.get("dont_show_tutorial")) {
		
		if (!Session.get("basics_tutorial_initialized")) {
			initBasicsTutorial("map");
		}
		
		var achievement = "created_action";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#addSubStory", "Map creation", "Click here to add a new action to the map");
			return;
		}
		// Not working :(
		// if (!userAchieved("edited_story_title")) {
		// 	showTutorialTip("edited_story_title", "#edit-title-input", "Map creation", "Edit the action content here. Click Save or press Enter when you're done.", "#save-story-title");
		// 	return;
		// }
		achievement = "created_another_action";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#addSubStory", "Map creation", "Now, click again to create a 2nd action");
			return;
		}
		// Not working :(
		// if (!userAchieved("advanced_status")) {
		// 	showTutorialTip("advanced_status", "#next-status-action", "Map creation", "Click here to change the action status", "#next-status-action");
		// 	return;
		// }
		achievement = "created_result";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#addStory", "Map creation", "Click here to create a result expected after these actions");
			return;
		}
		achievement = "selected_previous_story";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#vis", "Map creation", "Click on the 1st action to select it", "top");
			return;
		}		
		achievement = "created_fork";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#addSubStory", "Map creation", "Let's create an alternative path. Click here to create another path.");
			return;
		}
		achievement = "created_link";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#addLink", "Map creation", "Finally, let's create a link to the result. Click here to start linking, and then click on the result");
			return;
		}
		achievement = "invited_collaborators";
		if (!userAchieved(achievement)) {
			if (!checkConditions(achievement)) return;
			showTutorialTip(achievement, "#inviteUsers", "Map creation", "You rock! Once you're done editing the map, click here to invite others to collaborate on it.");
			return;
		}
	}
	
}

function initBasicsTutorial(page) {
	basicsTutorial = StateMachine.create({
		initial: (page === "dashboard") ? "started" : "mapOpened",
		events: [
			{ name: "createMap", from: ["started", "nonEmptyMap"], to: "mapOpened" },
			{ name: "openMap", from: ["started", "nonEmptyMap"], to: "mapOpened" },
			{ name: "detectExistingStories", from: "mapOpened", to: "nonEmptyMap" },
			{ name: "createAction", from: "mapOpened", to: "firstActionCreated" },
			{ name: "createResult", from: "mapOpened", to: "mapOpened" },
			{ name: "createAction", from: "firstActionCreated", to: "secondActionCreated" },
			{ name: "createResult", from: "firstActionCreated", to: "firstActionCreated" },
			{ name: "createResult", from: "secondActionCreated", to: "resultCreated" },
			{ name: "createAction", from: "secondActionCreated", to: "secondActionCreated" },
			{ name: "selectFirstAction", from: ["resultCreated", "notFirstActionSelected"], to: "firstActionSelected" },
			{ name: "selectNotFirstAction", from: "resultCreated", to: "notFirstActionSelected" },
			{ name: "createAction", from: "firstActionSelected", to: "forkActionSelected" },
			{ name: "createResult", from: "firstActionSelected", to: "notFirstActionSelected" },
			{ name: "selectNotForkAction", from: "forkActionSelected", to: "notForkActionSelected" },
			{ name: "selectForkAction", from: "notForkActionSelected", to: "forkActionSelected" },
			{ name: "startLinking", from: "forkActionSelected", to: "linkingStarted" },
			{ name: "createLink", from: "linkingStarted", to: "linkCreated" },
			{ name: "finishTutorial", from: "linkCreated", to: "tutorialFinished" }
		]
	});
	Session.set("basics_tutorial_initialized", true);
	
}

function checkConditions(achievement) {
	// if (achievement === "created_fork") {
	// 	var selectedStory = getSelectedStory();
	// 	if (selectedStory) {
	// 		return (selectedStory.type == "ACTION" && selectedStory.nextStories.length > 0);
	// 	}
	// 	return false;
	// }
	return true;
}

function showTutorialTip(achievement, domSelector, title, tip, placement) {
	// show tooltip
	console.log("showing tip at " + domSelector + ": " + tip);
	if (!placement) placement = "bottom";
	var title_html = '<span class="text-info"><strong>' + title + '</strong></span>';
    var tip_with_dismiss = tip + '<br/><a href="#" id="close" class="text-small" onclick="dismissTutorialTip(&quot;' + achievement + '&quot;, &quot;' + domSelector + '&quot;)">Dismiss</button>';
	console.log($(domSelector));
	$(domSelector).popover({
		html: 'true',
		title: title_html,
		content: tip_with_dismiss,
		animation: true,
		placement: placement
	});
	$(domSelector).popover('show');
	// register event handler that will add the achievement
	
	Deps.autorun(function() {
		console.log("reactive handler invoked for session key: " + achievement + "_done. Session value is: " + Session.get(achievement + "_done"));
		if (Session.get(achievement + "_done")) {
			Meteor.call("addUserAchievement", achievement);
			console.log("Added achievement: " + achievement);
			console.log("Achievement " + achievement + " unlocked");
		}
	});
}

dismissTutorialTip = function(achievement, domSelector) {
	$(domSelector).popover('hide');
	// add session flag not to show this tip
	Session.set("dont_show_tutorial", true);
}


Template.layout.helpers({
    map: function () {
        return Maps.findOne({_id: Session.get("mapId")});
    }
});

Template.layout.events({
    "click button#addStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "RESULT", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);
		Session.set("created_result_done", true);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#addSubStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "ACTION", Session.get("selectedStory"));
		Session.set("created_action_done", true);
		if (userAchieved("created_action")) {
			Session.set("created_another_action_done", true);
		}
		if (userAchieved("selected_previous_story")) {
			Session.set("created_fork_done", true);
		}
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









