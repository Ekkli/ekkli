
Maps = new Meteor.Collection("maps");
Stories = new Meteor.Collection("stories");
Opinions = new Meteor.Collection("opinions");
InvitedUsers = new Meteor.Collection("invited_users");


ACTION_LIFECYCLE = {
	CREATED: {
		name: "Created",
		color: "white",
		action: "Accept",
		next: "ACCEPTED"
	},
	ACCEPTED: {
		name: "Accepted",
		color: "lightblue",
		action: "Start",
		next: "STARTED"
	},
	STARTED: {
		name: "Started",
		color: "yellow",
		action: "Deliver",
		next: "DELIVERED"
	},
	DELIVERED: {
		name: "Delivered",
		color: "lightgreen",
		positive: true,
		action: null
	},
	IS_LATE: {
		name: "Is late",
		color: "orange",
		positive: false,
		action: "Deliver",
		next: "DELIVERED"
	},
	CANCELLED: {
		name: "Cancelled",
		color: "red",
		positive: false,
		action: null
	}	
}


RESULT_LIFECYCLE = {
	SUGGESTED: {
		name: "Suggested",
		color: "white",
		action: "Expect",
		next: "EXPECTED"
	},
	EXPECTED: {
		name: "Expected",
		color: "lightblue",
		action: "Meet",
		next: "MET"
	},
	MET: {
		name: "Met",
		color: "lightgreen",
		positive: true,
		action: null
	},
	MISSED: {
		name: "Missed",
		color: "red",
		positive: false,
		action: null
	}
}

STORY_TYPES = {
	"ACTION": {
		name: "Action",
		lifecycle: ACTION_LIFECYCLE,
		default_status: "CREATED"
	},
	"RESULT": {
		name: "Result",
		lifecycle: RESULT_LIFECYCLE,
		default_status: "SUGGESTED"
	}
}


lifecycle_statuses_for = function(story_type) {
	return STORY_TYPES[story_type].lifecycle;
}

getCurrentUserName=function () {
    var user = Meteor.user();
    if (user) {
		return user.username;
	}
	return "";
}

getCurrentUserId=function () {
    var user = Meteor.user();
    return user._id;
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

userAchieved = function(achievement) {
	var user = Meteor.user();
	if (user && user.achievements) {
		return user.achievements[achievement];		
	}
	else {
		return false;
	}
}

resolve_link_color=function (parent) {
            // determine the link color:
			// if the parent has other children, generate a random color
			// otherwise, find the grand-parent & pick the color of its link to the parent
			var color = generate_random_color();
			if (parent && parent.nextStories.length) {
				color = generate_random_color();
			}
			else if (parent) {
				var grand_parent = Stories.findOne({nextStories: parent._id});
				if (grand_parent) {
					for (var i = 0; i < grand_parent.nextStories.length; i++) {
						if (grand_parent.nextStories[i] === parent._id) {
							color = 	grand_parent.nextStoriesLinks[i].color || "gray";
							break;
						}
					}
				}
			}
		    return color;
} 

update_map_summary = function(map_id, update_type, story_type, new_status, old_status) {
	// TODO use atomic update
	var map = Maps.findOne({_id: map_id});
	if (update_type === "add") {
		map["count_" + story_type] += 1;
		map["count_" + story_type + "_" + new_status] += 1;
	}
	else if (update_type === "edit") {
		map["count_" + story_type + "_" + old_status] -= 1;
		map["count_" + story_type + "_" + new_status] += 1;
	}
	else if (update_type === "delete") {
		map["count_" + story_type] -= 1;
		map["count_" + story_type + "_" + new_status] -= 1;	
	}
	Maps.update({_id: map_id}, map);
}

addStory = function(toMap, title, storyType, parent) {
    var map = Maps.findOne({
        _id: toMap
    });

    if(map) {
        var query = {
            mapId: map._id
        };
        if(parent) query = {
            _id: parent
        };
        var lastStory = Stories.findOne(query, {
            sort: {
                createdTime: -1
            }
        });

        var storyCount = Stories.find({
            mapId: map._id
        }).count();

        var nextX = lastStory ? lastStory.x + 70 : 40,
            nextY = lastStory ? lastStory.y : 40;

        title = title ? title : storyType + " " + (storyCount + 1);

        var newStoryId = Stories.insert({
            mapId: map._id,
            title: title,
			author: getCurrentUserId(),
			author_name: getCurrentUserName(),
            author_email: (Meteor.user().emails) ? Meteor.user().emails[0].address : "",
            createdTime: new Date(),
            x: nextX,
            y: nextY,
            type: storyType,
            nextStories: [],
			nextStoriesLinks: [],
			lifecycle_status: STORY_TYPES[storyType].default_status
        });
		update_map_summary(map._id, "add", storyType, STORY_TYPES[storyType].default_status);

        if(lastStory) {
            console.log("linking: "+ lastStory.title + "->" +title);
			var color = resolve_link_color(lastStory);
			Stories.update({
                		_id: lastStory._id
            		}, 
				{
                		$addToSet: {
                     			nextStories: newStoryId
                		}
                }
            );
			Stories.update({
                		_id: lastStory._id
            		}, 
				{
                		$addToSet: {
                     			nextStoriesLinks: {
									color: color,
									author: getCurrentUserName()
								}
                		}
            		}
			);
        }
        return Stories.findOne({
            _id: newStoryId
        });
    }
};

update_story_status = function(story, status) {
	var lifecycle = lifecycle_statuses_for(story.type);
	if (status in lifecycle) {
		var old_status = story.lifecycle_status;
		Stories.update({_id: story._id}, {$set: {lifecycle_status: status}});
		Session.set("editing_status", false);
		update_map_summary(story.mapId, "edit", story.type, status, old_status);
	}
}

delete_story = function(story) {
	// get the list of previous stories
	var prev_stories = Stories.find({nextStories: story._id})
	
	// get the 1st next story	
	var next_story = null;
	if (story.nextStories) {
		next_story = Stories.findOne({_id: story.nextStories[0]});
	}

	// link the previous stories to the next story
	var some_prev = null;
	prev_stories.forEach(function(prev_story) {
		if (!some_prev) {
			some_prev = prev_story;
		} 
		var new_next_stories = [];
		$.each(prev_story.nextStories, function(n) {
			n = prev_story.nextStories[n];
			if (n != story._id) {
				new_next_stories.push(n);
			}
		});
		if (next_story) {
			new_next_stories.push(next_story._id);
		}
		prev_story.nextStories = new_next_stories;
		Stories.update({_id: prev_story._id}, prev_story);
	});
	
	// delete the story
	Stories.remove({_id: story._id});
	update_map_summary(story.mapId, "delete", story.type, story.lifecycle_status);
	// change the selected story
	if (some_prev || next_story) {
		var newly_selected_story = next_story || some_prev;
		selectStory(newly_selected_story._id);
	}
	
	// TODO log the deletion in the map activity stream
}

add_opinion = function(to_map, to_story, in_reply_to, opinion, speech_act, callback) {
	var new_opinion_id = Opinions.insert({
		map_id: to_map,
		story_id: to_story,
		in_reply_to: in_reply_to,
		text: opinion,
		speech_act: speech_act,
		author_id: Meteor.user()._id,
		author_name: getCurrentUserName()
	}); 
	var story = Stories.findOne({_id: to_story});
	if (story && !story.has_opinions) {
		story.has_opinions = true;
		Stories.update({_id: to_story}, story);
	}
	Session.set("adding_opinion", false)
	if (callback)
		callback();
};

update_opinion=function (opinion_id, text) {
	var opinion = Opinions.findOne({_id: opinion_id});
	if (opinion) {
		opinion.text = text;
		Opinions.update({_id: opinion_id}, opinion);
		Session.set("opinion_edited", "");
	}		
}

delete_opinion=function (opinion_id) {
	var opinion = Opinions.findOne({_id: opinion_id});
	if (opinion) {
		var to_story = opinion.story_id;
		Opinions.remove({_id: opinion_id});
		if (Opinions.find().count() == 0) {
			var story = Stories.findOne({_id: to_story});
			if (story && story.has_opinions) {
				story.has_opinions = false;
				Stories.update({_id: to_story}, story);
			}
		}
	}
}


add_link=function (from_story_id, to_story_id) {
	var from_story = Stories.findOne({_id: from_story_id});
	if (from_story) {
		var color = resolve_link_color(from_story);
                        Stories.update({
                                _id: from_story_id
                        },
                                {
                                $addToSet: {
                                        nextStories: to_story_id
                                }
                }
            );
                        Stories.update({
                                _id: from_story_id
                        },
                                {
                                $addToSet: {
                                        nextStoriesLinks: {
                                                                        color: color,
                                                                        author: getCurrentUserName()
                                                                }
                                }
                        }
                        );

		Session.set("creating_link_from", null);
	}
}


add_invited_user = function(email,map_id) {
        var newUserId = InvitedUsers.insert({
            email: email,
            is_created: false,
            map_id:map_id
        });

        return InvitedUsers.findOne({
            _id: newUserId
        });
};

update_invited_user=function (user_id, is_created) {
    var user = InvitedUsers.findOne({_id: user_id});
    if (user) {
        user.is_created = is_created;
        InvitedUsers.update({_id: user_id}, user);
    }
}

delete_invited_user=function (user_id) {
    InvitedUsers.remove({_id: user_id});
}




