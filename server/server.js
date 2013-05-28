
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
	return Opinions.find({
		story_id: storyId
	});
});








