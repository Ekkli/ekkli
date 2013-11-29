

Meteor.publish("maps", function(which, mapId, contextId) {
    
	if (!which) which = "mine";
	if (which == "mine") {
	    return Maps.find({
					contextId: contextId,
					$or: [
                        		{owner: this.userId, is_public: false, is_deleted: false},
                        		{participants: this.userId, is_public: false, is_deleted: false},
                                {_id:mapId}
						 ]
					});
	}
    else if (which == "own") {

        return Maps.find({
			contextId: contextId,
            $or:[{_id:mapId},
                {owner: this.userId, is_deleted: false, participants: { $ne: this.userId }}
            ]});

    }
    else if (which == "participate") {

            return Maps.find({
				contextId: contextId,
                $or:[{_id:mapId},
                    {participants: this.userId, is_deleted: false, owner: { $ne: this.userId}}
                ]});
    }
	else if (which == "public") {
        return Maps.find({
            $or:[{_id:mapId},
                {is_public: true, is_deleted: false}
            ]});
	}
	else if (which == "deleted") {
		return Maps.find({
			contextId: contextId,
			owner: this.userId, is_deleted: true
		});

	}
    else if (which == "recent") {
        return Maps.find({
			contextId: contextId,
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
	if (storyId === null)
		this.ready();
	else 
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
        {fields: {'profile': 1, 'badges': 1, 'achievements': 1, 'contextId': 1}});
});

Meteor.publish("map_participants", function (mapId) {
    var map = Maps.findOne({_id:mapId});
    if (map != undefined)
        return Meteor.users.find({
            $or:[{_id:{ $all : map.participants }},
                {_id:map.owner}]
        });
	else
 		this.ready();

});


Meteor.publish("dialog_map", function(mapId) {
    return Maps.findOne({
        _id: mapId
    });
});


Meteor.publish("contexts", function(contextId) {
	if (!contextId) {
		// get the context associated with the user
		var user = Meteor.users.find({_id: this.userId});
		contextId = user.contextId;
	}
	if (contextId)
		return getRelatedContexts(contextId);
	else {
		this.ready();
	}
});

getRelatedContexts = function(contextId) {
	return Contexts.find();
	/*
	// TODO return this code! Without it we're not secure
	// add the given context
	var ctx = Contexts.findOne({_id: contextId});
	var clauses = [{
		_id: contextId
	}];
	if (ctx.parents) {
		clauses.push({_id: { $in: ctx.parents}});
	}
	if (ctx.children) {
		clauses.push({_id: { $in: ctx.children}});
	}
	return Contexts.find({
		$or: clauses
	});
	*/
}


Meteor.startup(function () {
//    process.env.MAIL_URL="smtp://postmaster%40ekkli.mailgun.org:7d0sxp--frf1@smtp.mailgun.org:587";
    process.env.MAIL_URL="smtp://ekkliapp%40gmail.com:ekkli1234@smtp.gmail.com:465/";
});








