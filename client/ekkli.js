

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
	if (userNeedsTutorial("MASTERS_BASICS")) {
		var achievement = "created_map";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#createMap", "Start here!", "Click here to create a new map", "#createMap");
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
	if (userNeedsTutorial("MASTERS_BASICS")) {
		var achievement = "created_action";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#addSubStory", "Map creation", "Click here to add a new action to the map", "#addSubStory");
			return;
		}
		// Not working :(
		// if (!userAchieved("edited_story_title")) {
		// 	showTutorialTip("edited_story_title", "#edit-title-input", "Map creation", "Edit the action content here. Click Save or press Enter when you're done.", "#save-story-title");
		// 	return;
		// }
		achievement = "created_another_action";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#addSubStory", "Map creation", "Now, click again to create a 2nd action", "#addSubStory");
			return;
		}
		// Not working :(
		// if (!userAchieved("advanced_status")) {
		// 	showTutorialTip("advanced_status", "#next-status-action", "Map creation", "Click here to change the action status", "#next-status-action");
		// 	return;
		// }
		achievement = "created_result";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#addStory", "Map creation", "Click here to create a result expected after these actions", "#addStory");
			return;
		}
		achievement = "selected_previous_story";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#vis", "Map creation", "Click on the 1st action to select it", "#vis", "top");
			return;
		}		
		achievement = "created_fork";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#addSubStory", "Map creation", "Now, click here to fork into alternative path", "#addSubStory");
			return;
		}
		achievement = "created_link";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#addLink", "Map creation", "Finally, let's create a link to the result. Click here to start linking, and then click on the result", "#addLink");
			return;
		}
		achievement = "invited_collaborators";
		if (!userAchieved(achievement) && !Session.equals("dont_tip_on_" + achievement, true)) {
			showTutorialTip(achievement, "#inviteUsers", "Map creation", "You rock! Once you're done editing the map, click here to invite others to collaborate on it.", "#inviteUsers");
			return;
		}
	}
	
}

function showTutorialTip(achievement, domSelector, title, tip, elementToListenTo, placement) {
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
	$(elementToListenTo).one("click", function() {
		Meteor.call("addUserAchievement", achievement);
		console.log("Achievement " + achievement + " unlocked");
	});
}

dismissTutorialTip = function(achievement, domSelector) {
	$(domSelector).popover('hide');
	// add session flag not to show this tip
	Session.set("dont_tip_on_" + achievement, true);
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









