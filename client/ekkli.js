

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
	
	// TODO record achievement
	if (typeof basicsTutorial != 'undefined' && typeof context.params._id != 'undefined') basicsTutorial.openMap();
}

function initDashboardTutorial(context, page) {
	initBasicsTutorial("dashboard");
	if (typeof basicsTutorial != 'undefined') basicsTutorial.closeMap();
}

function initMapTutorial(context, page) {	
	initBasicsTutorial("map");
}
function initBasicsTutorial(page) {
	if (typeof basicsTutorial != 'undefined') return;
	
	console.log("Initializing basics tutorial");
	if (!userNeedsTutorial("MASTERS_BASICS") || Session.get("dont_show_tutorial")) return;

	if (!Session.get("basics_tutorial_initialized") && typeof basicsTutorial == 'undefined') {
	
		basicsTutorial = StateMachine.create({
			initial: (page === "dashboard") ? "Started" : "MapOpened",
			events: [
				{ name: "createMap", from: ["Started", "NonEmptyMap"], to: "MapOpened" },
				{ name: "openMap", from: ["Started", "NonEmptyMap", "MapOpened"], to: "MapOpened" },
				{ name: "closeMap", from: ["Started", "MapOpened"], to: "Started" },
				{ name: "detectExistingStories", from: "MapOpened", to: "NonEmptyMap" }, /* TODO Fire! */
				{ name: "createAction", from: "MapOpened", to: "FirstActionCreated" },
				{ name: "createResult", from: "MapOpened", to: "MapOpened" },
				{ name: "createAction", from: "FirstActionCreated", to: "SecondActionCreated" },
				{ name: "createResult", from: "FirstActionCreated", to: "FirstActionCreated" },
				{ name: "createResult", from: "SecondActionCreated", to: "ResultCreated" },
				{ name: "createAction", from: "SecondActionCreated", to: "SecondActionCreated" },
				{ name: "createAction", from: "ResultCreated", to: "ResultCreated" },
				{ name: "selectFirstAction", from: ["ResultCreated", "NotFirstActionSelected"], to: "FirstActionSelected" },
				{ name: "selectNotFirstAction", from: ["ResultCreated", "FirstActionSelected", "NotFirstActionSelected"], to: "NotFirstActionSelected" },
				{ name: "createAction", from: "FirstActionSelected", to: "ForkActionSelected" },
				{ name: "createResult", from: "FirstActionSelected", to: "NotFirstActionSelected" },
				{ name: "selectNotForkAction", from: ["ForkActionSelected", "NotForkActionSelected"], to: "NotForkActionSelected" },
				{ name: "selectForkAction", from: ["ForkActionSelected", "NotForkActionSelected"], to: "ForkActionSelected" },
				{ name: "startLinking", from: "ForkActionSelected", to: "LinkingStarted" },
				{ name: "createLink", from: "LinkingStarted", to: "LinkCreated" },
				{ name: "finishTutorial", from: "LinkCreated", to: "TutorialFinished" }
			],
			callbacks: {
				onStarted: function(event, from, to) {
					console.log(to);
					showTutorialTip("#createMap", "Start here!", "Click here to create a new map", "up_left", 60, 200);
				},
				onMapOpened: function(event, from, to) {
					console.log(to);
					showTutorialTip("#addSubStory", "Map creation", "Click here to add a new action to the map", "up_left", 60, 200);
				},
				onNonEmptyMap: function(event, from, to) {
					console.log(to);
					this.closeMap();
				},
				onFirstActionCreated: function(event, from, to) {
					console.log(to);
					Session.set("basics_tutorial_first_action_id", Session.get("selectedStory"));
					console.log("Setting: basics_tutorial_first_action_id: " + Session.get("basics_tutorial_first_action_id"));
					showTutorialTip("#addSubStory", "Map creation", "Now, click again to create a 2nd action", "up_left", 60, 200);
				},
				onSecondActionCreated: function(event, from, to) {
					console.log(to);
					showTutorialTip("#addStory", "Map creation", "Click here to create a result expected after these actions", "up_left", 200, 200);
				},
				onResultCreated: function(event, from, to) {
					console.log(to);
					Session.set("basics_tutorial_result_id", Session.get("selectedStory"));
					console.log("Setting: basics_tutorial_result_id: " + Session.get("basics_tutorial_result_id"));
					showTutorialTip("#vis", "Map creation", "Click on the 1st action to select it", "down_left", 200, 50);
				},
				onNotFirstActionSelected: function(event, from, to) {
					console.log(to);
					showTutorialTip("#vis", "Map creation", "Click on the 1st action to select it", "down_left", 200, 50);
				},
				onFirstActionSelected: function(event, from, to) {
					console.log(to);
					showTutorialTip("#addSubStory", "Map creation", "Let's create an alternative path. Click here to create another path.", "up_left", 200, 200);
				},
				onForkActionSelected: function(event, from, to) {
					console.log(to);
					Session.set("basics_tutorial_fork_action_id", Session.get("selectedStory"));
					console.log("Setting: basics_tutorial_fork_action_id: " + Session.get("basics_tutorial_fork_action_id"));
					showTutorialTip("#addLink", "Map creation", "Finally, let's create a link to the result. Click here to start linking, and then click on the result", "up_left", 200, 200);
				},
				onNotForkActionSelected: function(event, from, to) {
					console.log(to);
					showTutorialTip("#vis", "Map creation", "Click on the forked action to select it", "bottom_left", 200, 50);
				},
				onLinkingStarted: function(event, from, to) {
					console.log(to);
					
				},
				onLinkCreated: function(event, from, to) {
					console.log(to);
					showTutorialTip("#inviteUsers", "Map creation", "You rock! Once you're done editing the map, click here to invite others to collaborate on it.", "up_left", 200, 200);
					this.finishTutorial();
				},
				onTutorialFinished: function(event, from, to) {
					console.log(to);
				}
			}
		});
		
		
		Session.set("basics_tutorial_initialized", true);
	}
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

/*function showTutorialTip(domSelector, title, tip, placement) {
	// show tooltip
	console.log("showing tip at " + domSelector + ": " + tip);
	if (!placement) placement = "bottom";
	var title_html = '<span class="text-info"><strong>' + title + '</strong></span>';
    var tip_with_dismiss = tip + '<br/><a href="#" id="close" class="text-small" onclick="dismissTutorialTip(&quot;' + domSelector + '&quot;)">Dismiss</button>';
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
	/*
	Deps.autorun(function() {
		console.log("reactive handler invoked for session key: " + achievement + "_done. Session value is: " + Session.get(achievement + "_done"));
		if (Session.get(achievement + "_done")) {
			Meteor.call("addUserAchievement", achievement);
			console.log("Added achievement: " + achievement);
			console.log("Achievement " + achievement + " unlocked");
		}
	});
}*/

function showTutorialTip(domSelector, title, tip, placement, top, left) {
	// show tooltip
	console.log("showing tip at " + top + ", " + left + ": " + tip);
	if (!placement) placement = "bottom";
	Session.set("tutorial_tip_title", title);
	Session.set("tutorial_tip_text", tip);
	Session.set("tutorial_tip_arrow_direction", placement);
	Session.set("tutorial_tip_top", top);
	Session.set("tutorial_tip_left", left);
	console.log("trying to show tip");
	Session.set("show_tutorial_tip", true);
}

dismissTutorialTip = function(domSelector) {
	Session.set("show_tutorial_tip", false);
	// add session flag not to show this tip
	Session.set("dont_show_tutorial", true);
}


Template.tip.helpers({
	display: function() {
		if (Session.equals("show_tutorial_tip", true))
			return "block";
		else
			return "none";
	},
	top: function() {
		return Session.get("tutorial_tip_top");
	},
	left: function() {
		return Session.get("tutorial_tip_left");
	},
	tip_text: function() {
		return Session.get("tutorial_tip_text");
	},
	arrow_direction: function() {
		var dir = Session.get("tutorial_tip_arrow_direction");
		if (dir) dir = dir.trim();
		return dir;
	}
});


Template.tip.events({
	"click .close": function() {
		console.log("closing");
		Session.set("show_tutorial_tip", false);
		Session.set("dont_show_tutorial", true);
	}
})



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
		
		// TODO record achievement
		if (typeof basicsTutorial != 'undefined') basicsTutorial.createResult();
		
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
		
		// TODO record achievement
		if (typeof basicsTutorial != 'undefined') basicsTutorial.createAction();
		
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
			
			if (typeof basicsTutorial != 'undefined') basicsTutorial.startLinking();
			
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









