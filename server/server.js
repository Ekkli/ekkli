

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
    else if (which == "recent") {
        return Maps.find({
            $or: [
                {owner: this.userId, is_public: false, is_deleted: false},
                {participants: this.userId, is_public: false, is_deleted: false},
                {is_public: true, is_deleted: false}
            ]
        },{sort: {last_update:-1},limit:10});

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

Meteor.publish("userData", function () {
    return Meteor.users.find({_id: this.userId},
        {fields: {'profile': 1, 'badges': 1, 'achievements': 1}});
});

Meteor.startup(function () {
//    process.env.MAIL_URL="smtp://postmaster%40ekkli.mailgun.org:7d0sxp--frf1@smtp.mailgun.org:587";
    process.env.MAIL_URL="smtp://ekkliapp%40gmail.com:ekkli1234@smtp.gmail.com:465/";
});








