
Meteor.publish("maps", function(which) {
	if (!which) which = "mine";
	if (which == "mine") {
	    return Maps.find({
					$or: [
                        		{owner: this.userId, is_public: false, is_deleted: false},
                        		{participants: this.userId, is_public: false, is_deleted: false}
						 ]
					});
	}
        else if (which == "own") {
                return Maps.find({owner: this.userId, is_deleted: false, participants: { $ne: this.userId }});
        }
        else if (which == "participate") {
                return Maps.find({participants: this.userId, is_deleted: false, owner: { $ne: this.userId}});
        }
	else if (which == "public") {
		return Maps.find({is_public: true, is_deleted: false});	
	}
	else if (which == "deleted") {
		return Maps.find({owner: this.userId, is_deleted: true});

	}
});

Meteor.publish("stories", function(mapId) {
    return Stories.find({
        mapId: mapId
    });
});

Meteor.publish("opinions", function(storyId) {
	if (storyId === null) return [];
	return Opinions.find({
		story_id: storyId
	});
});

Meteor.publish("invited_users", function(user_id) {
    return InvitedUsers.find({
        _id: user_id
    });
});

Accounts.onCreateUser(function(options, user) {
	user.badges = [];
	user.achievements = {
		created_map: false,
		created_action: false,
		edited_story_title: false,
		created_result: false,
		advanced_status: false,
		selected_previous_story: false,
		created_fork: false,
		created_link: false,
		invited_collaborators: false,
		maps_created: 0,
		actions_created: 0,
		actions_delivered: 0,
		results_created: 0,
		results_delivered: 0
	};
	return user;
});


Meteor.startup(function () {
    process.env.MAIL_URL="smtp://postmaster%40ekkli.mailgun.org:7d0sxp--frf1@smtp.mailgun.org:587";
});








