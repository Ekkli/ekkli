
Deps.autorun(function() {
	Meteor.subscribe("maps", Session.get("whichMaps"), Session.get("mapId"), Session.get("contextId"), function() {
		Session.set("maps_loaded", true);
		initDashboardTutorial();
	});
});

Deps.autorun(function() {
	Meteor.subscribe("contexts", Session.get("contextId"), function() {
		Session.set("show_edit_context_menu", false);
	});
});

Deps.autorun(function() {
    Meteor.subscribe("stories", Session.get("mapId"), function() {
		Session.set("stories_loaded", true);
		console.log("Stories loaded");
		initMapTutorial();
	});
    Meteor.subscribe("map_participants", Session.get('mapId'));
});

Deps.autorun(function() {
	Meteor.subscribe("opinions", Session.get("selectedStory"), function() {
		Session.set("opinions_loaded", true);
		initMapTutorial();
	});
});

Deps.autorun(function() {
    Meteor.subscribe("invited_user", Session.get('invited_user_id'));
});

Deps.autorun(function() {
    Meteor.subscribe("dialog_map", Session.get('dialog_map_id'));
});

Deps.autorun(function() {
	Meteor.subscribe("userData");
});



Meteor.pages({
    '/':            		{to: 'maps', as: 'root', nav: 'maps', before: [setMap, initDashboardTutorial]},
    '/maps':       			{to: 'maps', as: 'maps', nav: 'maps', before: [setMap, initDashboardTutorial]},
    '/map/:_id':   			{to: 'map', nav: 'map', before: [setMap, initMapTutorial]},
    '/map/:_id/user_id/:invited_user':   {to: 'map', nav: 'accept_invitation', before: [login, initMapTutorial]},
    '/map/:_id/export': 	{to: 'map_export', nav: 'map_export', before: [setMap]},
	'/admin/upgrade':		{to: 'migrations', nav: 'migrations'},

    '*' :   '404'
});


function welcome() {
    if(Meteor.user()){
        this.template('map');
        this.done();
    }

}


function login() {
	Session.set("whichMaps",'participate');
    if(Meteor.user()){
        this.template('welcome');
        var map_id = this.params._id;
		Meteor.call("relate_user_to_map", Meteor.user()._id, map_id, function() {
			console.log("Related user " + Meteor.user()._id + " to map " + map_id);
		});
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
	console.log("setMap");
	console.log(context);
	console.log("==========================================")
	if (Meteor.user() && !Session.get("contextId")) {
		var user = Meteor.user();
		if (user.contextId) Session.set("contextId", user.contextId);
	}
	
    var _id = context.params._id;
	if (!Session.equals("mapId", _id)) {
		Session.set("mapId", _id);
		$('html,body').scrollTop(0);
		if (!_id) {
			Session.set("stories_loaded", false);
		    Session.set("selectedStory", null);
		}
	}

	// TODO record achievement
	if (typeof basicsTutorial != 'undefined') {
		if (typeof context.params._id != 'undefined') {
			basicsTutorial.openMap();
		}
		else {
			basicsTutorial.closeMap();
		}
	}
}

userNeedsTutorial = function(badge) {
	var user = Meteor.user();
	if (user && user.badges) {
		return !(_.contains(user.badges, badge));
	}
	else {
			return false;
	}
}

function initDashboardTutorial(context, page) {
	if (!context) return;
	initBasicsTutorial("dashboard");
	if (typeof basicsTutorial != 'undefined') {
		basicsTutorial.closeMap();
	}
}

function initMapTutorial(context, page) {
	initBasicsTutorial("map");
	if (typeof basicsTutorial != 'undefined') basicsTutorial.inferState();
}

function initBasicsTutorial(page) {
	if (typeof basicsTutorial != 'undefined') return;

	if (!userNeedsTutorial("MASTERS_BASICS") || Session.get("dont_show_tutorial")) return;

	if (!Session.get("basics_tutorial_initialized") && typeof basicsTutorial == 'undefined') {
		var ALL_STATES = [
			"Started",
			"MapOpened",
			"NotOwner",
			"Reopened",
			"FirstActionCreated",
			"SecondActionCreated",
			"GoalCreated",
			"NotFirstActionSelected",
			"FirstActionSelected",
			"ForkActionSelected",
			"NotForkActionSelected",
			"LinkingStarted",
			"LinkCreated",
			"TutorialFinished"
		];
		basicsTutorial = StateMachine.create({
			initial: (page === "dashboard") ? "Started" : "MapOpened",
			events: [
				{ name: "createMap", from: ["Started", "NotOwner"], to: "MapOpened" },
				{ name: "openMap", from: ["Started", "NotOwner", "MapOpened"], to: "MapOpened" },
				{ name: "closeMap", from: ALL_STATES, to: "Started" },
				{ name: "detectNotOwner", from: "MapOpened", to: "NotOwner" },
				{ name: "reopen", from: "MapOpened", to: "Reopened" },
				{ name: "createAction", from: "Reopened", to: "Reopened" },
				{ name: "createGoal", from: "Reopened", to: "Reopened" },
				{ name: "startLinking", from: "Reopened", to: "Reopened" },
				{ name: "createLink", from: "Reopened", to: "Reopened" },
				{ name: "createAction", from: "MapOpened", to: "FirstActionCreated" },
				{ name: "createGoal", from: "MapOpened", to: "MapOpened" },
				{ name: "createAction", from: "FirstActionCreated", to: "SecondActionCreated" },
				{ name: "createGoal", from: "FirstActionCreated", to: "FirstActionCreated" },
				{ name: "createGoal", from: "SecondActionCreated", to: "GoalCreated" },
				{ name: "createAction", from: "SecondActionCreated", to: "SecondActionCreated" },
				{ name: "createAction", from: "GoalCreated", to: "GoalCreated" },
				{ name: "selectFirstAction", from: ["GoalCreated", "NotFirstActionSelected"], to: "FirstActionSelected" },
				{ name: "selectNotFirstAction", from: ["GoalCreated", "FirstActionSelected", "NotFirstActionSelected"], to: "NotFirstActionSelected" },
				{ name: "createAction", from: "FirstActionSelected", to: "ForkActionSelected" },
				{ name: "createGoal", from: "FirstActionSelected", to: "NotFirstActionSelected" },
				{ name: "selectNotForkAction", from: ["ForkActionSelected", "NotForkActionSelected"], to: "NotForkActionSelected" },
				{ name: "selectForkAction", from: ["ForkActionSelected", "NotForkActionSelected"], to: "ForkActionSelected" },
				{ name: "startLinking", from: "ForkActionSelected", to: "LinkingStarted" },
				{ name: "createLink", from: "LinkingStarted", to: "LinkCreated" },
				{ name: "finishTutorial", from: "LinkCreated", to: "TutorialFinished" }
			],
			callbacks: {
				onenterstate: function(event, from, to) {
				},
				onStarted: function(event, from, to) {
					if (!userNeedsTutorial("MASTERS_BASICS")) {
						Session.set("show_tutorial_tip", false);
						return;
					}
					Session.set("tutorial_active", true);
					showTutorialTip("#createMap", "Start here!", "Click here to create a new map", "up", "left", 50, 200);
				},
				onMapOpened: function(event, from, to) {
					console.log(to);
					showTutorialTip("#addSubStory", "Map creation", "Click here to add a new action to the map", "up", "left", 50, 270);
				},
				onNotOwner: function(event, from, to) {
					console.log(to);
					Session.set("tutorial_active", false);
				},
				onReopened: function(event, from, to) {
					Session.set("tutorial_active", false);
				},
				onFirstActionCreated: function(event, from, to) {
					console.log(to);
					Session.set("basics_tutorial_first_action_id", Session.get("selectedStory"));
					showTutorialTip("#addSubStory", "Map creation", "Now, click again to create a 2nd action", "up", "left", 50, 270);
				},
				onSecondActionCreated: function(event, from, to) {
					console.log(to);
					//showTutorialTip("#addStory", "Map creation", "Click here to create a goal", "up", "right", 50, 105);
					showTutorialTip("#addStory", "Map creation", "Click here to create a goal", "up", "left", 50, 305);
				},
				onGoalCreated: function(event, from, to) {
					console.log(to);
					Session.set("basics_tutorial_goal_id", Session.get("selectedStory"));
					showTutorialTip(null, "Map creation", "Click on the 1st action to select it", "up", "left", 350, 220);
				},
				onNotFirstActionSelected: function(event, from, to) {
					console.log(to);
					showTutorialTip(null, "Map creation", "Click on the 1st action to select it", "up", "left", 300, 220);
				},
				onFirstActionSelected: function(event, from, to) {
					console.log(to);
					showTutorialTip("#addSubStory", "Map creation", "Let's create an alternative path. Click here to create another path.", "up", "left", 50, 270);
				},
				onForkActionSelected: function(event, from, to) {
					console.log(to);
					Session.set("basics_tutorial_fork_action_id", Session.get("selectedStory"));
					showTutorialTip("#addLink", "Map creation", "Finally, click on +Link", "up", "left", 70, 20);
				},
				onNotForkActionSelected: function(event, from, to) {
					console.log(to);
					showTutorialTip(null, "Map creation", "Click on the forked action to select it", "up", "left", 350, 320);
				},
				onLinkingStarted: function(event, from, to) {
					console.log(to);
				},
				onLinkCreated: function(event, from, to) {
					console.log(to);
					showTutorialTip("#createMap", "Map creation", "Congrats! You've built your first map.", "", "", 50, 200);
					this.finishTutorial();
				},
				onTutorialFinished: function(event, from, to) {
					console.log(to);
					Meteor.call("addUserBadge", "MASTERS_BASICS");
				}
			}
		});
		basicsTutorial.inferState = function() {
			var to = this.current;

			// TODO check the current page - if on dashboard, switch to state: Started. If on map page, switch to MapOpened

			if (Session.get("mapId")) {
				if (to == "MapOpened") {
					// verify owner
					var map = Maps.findOne({_id: Session.get("mapId")});
					if (map && map.owner && map.owner !== Meteor.user()._id) {
						this.detectNotOwner();
						return;
					}

					var actionCount = 0,
						goalCount = 0;
					var stories = Stories.find();
					stories.forEach(function(s) {
						if (s.type == "ACTION") {
							actionCount++;
						}
						else if (s.type == "GOAL") {
							goalCount++;
						}
					});
					if (actionCount > 0 || goalCount > 0) {
						this.reopen();
					}

					// now analyze links


					// finally, invoke the appropriate jumpToSTATE event


				}
			}
			else {
				if (to == "MapOpened") {
					this.closeMap();
				}
			}
		}

		Session.set("basics_tutorial_initialized", true);
	}
}


function showTutorialTip(domSelector, title, tip, placement, side, top, left, isRetry) {
	//console.log("showTutorialTip called with: " + domSelector + ", " + tip);
	// show tooltip
	if (!placement) placement = "up";
	if (domSelector && $(domSelector) && $(domSelector).position()) {
			var pos = $(domSelector).position()
		    	h = $(domSelector).height(),
				w = $(domSelector).width(),
				tip_w = $("#tip-cell").width();
			if (placement === "up") {
				top = pos.top + h + 20;
			}
			else if (placement === "down") {
				top = pos.top - 20;
			}
			if (side === "left") {
				left = pos.left + w/2 + 100;
			}
			else if (side === "right") {
				left = pos.left + w/2 - tip_w + 80;
			}
	}
	else if (domSelector && !isRetry) {
		setTimeout(function() {
			showTutorialTip(domSelector, title, tip, placement, side, top, left, true);
		}, 100);
		return;
	}
	Session.set("tutorial_tip_title", title);
	Session.set("tutorial_tip_text", tip);
	Session.set("tutorial_tip_arrow_direction", placement);
	Session.set("tutorial_tip_arrow_side", side);
	Session.set("tutorial_tip_top", top);
	Session.set("tutorial_tip_left", left);
	Session.set("show_tutorial_tip", true);
}

dismissTutorialTip = function(domSelector) {
	Session.set("show_tutorial_tip", false);
	// add session flag not to show this tip
	Session.set("dont_show_tutorial", true);
}


Template.tip.helpers({
	display: function() {
		if (Meteor.user() && Session.equals("show_tutorial_tip", true) && Session.equals("tutorial_active", true) && typeof basicsTutorial != 'undefined')
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
		dir += "_" + Session.get("tutorial_tip_arrow_side");
		return dir;
	},
	arrow_side_left: function() {
		return Session.equals("tutorial_tip_arrow_side", "left");
	},
	arrow_side_right: function() {
		return Session.equals("tutorial_tip_arrow_side", "right");
	}

});


Template.tip.events({
	"click .dismiss": function() {
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
        var newStory = addStory(Session.get("mapId"), "", "GOAL", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);

		// TODO record achievement
		if (typeof basicsTutorial != 'undefined') basicsTutorial.createGoal();

		Session.set("created_goal_done", true);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#addSubStory": function(e) {
        e.preventDefault();
        var newStory = addStory(Session.get("mapId"), "", "ACTION", Session.get("selectedStory"));

		// Session.set("created_action_done", true);
		// if (userAchieved("created_action")) {
		// 	Session.set("created_another_action_done", true);
		// }
		// if (userAchieved("selected_previous_story")) {
		// 	Session.set("created_fork_done", true);
		// }

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
		sendVerificationEmail: false
	});
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL'
	});
	if (!Session.get("whichMaps")) {
		if (amplify.store("whichMaps")) {
			Session.set("whichMaps", amplify.store("whichMaps"));
		}
	}

  // svgPanFactory($);
  //$(".editabl).aloha();
});









