
Maps = new Meteor.Collection("maps");
Stories = new Meteor.Collection("stories");
Opinions = new Meteor.Collection("opinions");
InvitedUsers = new Meteor.Collection("invited_users");
Contexts = new Meteor.Collection("contexts");


ACTION_LIFECYCLE = {
    CREATED: {
        name: "Created",
        color: "white",
        action: "Mark as nice to have",
        next: "NICE_TO_HAVE"
    },
    NICE_TO_HAVE: {
        name: "Nice to have",
        color: "lightgrey",
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
        action: "Tests pass",
        next: "TESTS_PASS"
    },
    TESTS_PASS: {
        name: "Tests pass",
        color: "green",
        positive: true,
        action: null
    },
    TESTS_FAIL: {
        name: "Tests fail",
        color: "red",
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
        color: "grey",
        positive: false,
        action: null
    }
}


GOAL_LIFECYCLE = {
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
    "GOAL": {
        name: "Goal",
        lifecycle: GOAL_LIFECYCLE,
        default_status: "SUGGESTED"
    }
}


lifecycle_statuses_for = function(story_type) {
    return STORY_TYPES[story_type].lifecycle;
}

getCurrentUserField = function(field) {
    var user = Meteor.user();
    if (user && user.profile) {
        return user.profile[field];
    }
    return "";
}

getCurrentUserName = function () {
	return getCurrentUserField('name');
}

getCurrentUserEmail = function () {
    return getCurrentUserField('email');
}

getCurrentUserPicture = function () {
    return getCurrentUserField('picture');
}

getCurrentUserId=function () {
    var user = Meteor.user();
    return user._id;
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


resolve_link_color = function (parent) {
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
    Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
}

findStoriesY = function(stories) {
  var y_values = [];
  $.each(stories, function(n) {
    var s = Stories.findOne({_id: stories[n]});
    if (s) y_values.push(s.y);
  });
  return y_values;
}

findMaxY = function(stories) {
  var y_values = findStoriesY(stories);
  if (y_values.length)
    return Math.max.apply(null, y_values);
  else
    return null;
}


findMinY = function(stories) {
  var y_values = findStoriesY(stories);
  if (y_values.length)
    return Math.min.apply(null, y_values);
  else
    return null;
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

        var nextX = lastStory ? lastStory.x + 70 : 200,
            nextY = lastStory ? lastStory.y : 200;
		var grandParent = Stories.findOne({nextStories: lastStory._id});
    if (lastStory && lastStory.nextStories.length) {
			// forking:
      // find the forking direction according to the grandparent's children:
      // if the children's Y are all lower than the parent, the direction
      // should be up, else it should be down.
      // (this is in order to achieve Fishbone layout by default).
      var maxGrandParentChild = findMaxY(grandParent.nextStories);
      if (maxGrandParentChild > nextY) {
        // direction is up - get the child with min Y, & set the new story Y upper
        var minY = findMinY(lastStory.nextStories) || nextY;
        nextY = minY - 50;
      }
      else {
        // direction is down - get the child with max Y, & set the new story Y lower
        var maxY = findMaxY(lastStory.nextStories) || nextY;
        nextY = maxY + 50;
      }


		}
		else if (lastStory) {
			// not forking - just continue the vector
			if (grandParent) {
				var dx = lastStory.x - grandParent.x,
				dy = lastStory.y - grandParent.y;
				nextX = lastStory.x + dx;
				nextY = lastStory.y + dy;
			}
		}

        title = title ? title : storyType + " " + (storyCount + 1);

        var newStoryId = Stories.insert({
            mapId: map._id,
            title: title,
            author: getCurrentUserId(),
            author_name: getCurrentUserName(),
            author_email: getCurrentUserEmail(),
            picture_url: getCurrentUserPicture(),
            createdTime: new Date(),
            x: nextX,
            y: nextY,
            type: storyType,
            nextStories: [],
            nextStoriesLinks: [],
            lifecycle_status: STORY_TYPES[storyType].default_status,
			voting_counts: {
				POSITIVE: 0,
				NEGATIVE: 0,
				WARNING: 0
			}
        });
        update_map_summary(map._id, "add", storyType, STORY_TYPES[storyType].default_status);

        if(lastStory) {
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
							id: newStoryId,
                            color: color,
                            author: getCurrentUserName()
                        }
                    }
                }
            );
        }
        Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
		selectStory(newStoryId);
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
        Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
    }
}

update_story_voting_counts = function(storyId) {
	counts = count_opinions_by_speech_acts(storyId);
	Stories.update({_id: storyId}, {$set: {voting_counts: counts}});
}

delete_story = function(story) {
    // get the list of previous stories
    var prev_stories = Stories.find({nextStories: story._id})

    // get the 1st next story
    var next_story = null,
	    next_story_link = null;
    if (story.nextStories.length > 0) {
        next_story = Stories.findOne({_id: story.nextStories[0]});
    }
	if (next_story) {
    	$.each(story.nextStoriesLinks, function(n) {
        	var l = story.nextStoriesLinks[n];
        	if (l.id === next_story._id) {
            	next_story_link = l;
        	}
    	});
	}

    // link the previous stories to the next story
    var some_prev = null;
    prev_stories.forEach(function(prev_story) {
        if (!some_prev) {
            some_prev = prev_story;
        }
        var new_next_stories = [],
		    new_next_links = [];
        $.each(prev_story.nextStories, function(n) {
            n = prev_story.nextStories[n];
            if (n != story._id) {
                new_next_stories.push(n);
            }
        });
        $.each(prev_story.nextStoriesLinks, function(n) {
            var l = prev_story.nextStoriesLinks[n];
            if (l.id !== story._id) {
                new_next_links.push(l);
            }
        });
        if (next_story) {
            new_next_stories.push(next_story._id);
        }
		if (next_story_link) {
			new_next_links.push(next_story_link);
		}
        prev_story.nextStories = new_next_stories;
		prev_story.nextStoriesLinks = new_next_links;
		// TODO update fields
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
    Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});

    // TODO log the deletion in the map activity stream
}

count_opinions_by_speech_acts = function(storyId) {
	var opinions = Opinions.find({story_id: storyId}).fetch();
	var counts = {
		POSITIVE: 0,
		NEGATIVE: 0,
		WARNING: 0
	};
	opinions.forEach(function(op) {
		counts[op.speech_act] += 1;
	})
	return counts;
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
	update_story_voting_counts(to_story);
    Session.set("adding_opinion", false);
    Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
    if (callback)
        callback();
};

update_opinion=function (opinion_id, text) {
    var opinion = Opinions.findOne({_id: opinion_id});
    if (opinion) {
        opinion.text = text;
        Opinions.update({_id: opinion_id}, opinion);
        Session.set("opinion_edited", "");
        Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
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
		update_story_voting_counts(to_story);
        Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
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
        Session.set('last_map_update',{'current_time':new Date(),'mapId':Session.get('mapId')});
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

addContext = function(name, description, contextType, parentId, childId) {
	var ctx = {
			name: name,
			description: description,
			type: contextType,
	};
	if (parentId) ctx.parents = [parentId];
	if (childId) ctx.children = [childId];
	var contextId = Contexts.insert(ctx);
	// update the child or parent
	if (parentId) {
		Contexts.update({_id: parentId}, {
			$addToSet: { children: contextId }
		});
	}
	if (childId) {
		Contexts.update({_id: childId}, {
			$addToSet: { parents: contextId }
		});
	}
	return contextId;
}

updateContext = function(contextId, changes) {
	Contexts.update({_id: contextId}, {
		$set: changes
	});
}

deleteContext = function(context) {
	var someParent = null,
	    someChild = null,
		i = 0;
	// go over parents & remove child
	if (context.parents) {
		for (i = 0; i < context.parents.length; i++) {
			var ctx = context.parents[i];
			if (!someParent) someParent = ctx;
			Contexts.update({_id: ctx}, {
				$pull: { children: context._id }
			});
		}
	}
	// go over children & remove parent
	if (context.children) {
		for (i = 0; i < context.children.length; i++) {
			var ctx = context.children[i];
			if (!someChild) someChild = ctx;
			Contexts.update({_id: ctx}, {
				$pull: { parents: context._id }
			});
		}
	}
	// connect parents to some child
	if (context.parents && someChild) {
		for (i = 0; i < context.parents.length; i++) {
			var ctx = context.parents[i];
			Contexts.update({_id: ctx}, {
				$addToSet: { children: someChild }
			});
		}
	}
	// connect children to some parent
	if (context.children && someParent) {
		for (i = 0; i < context.children.length; i++) {
			var ctx = context.children[i];
			Contexts.update({_id: ctx}, {
				$addToSet: { parents: someParent }
			});
		}
	}
	// delete context
	Contexts.remove({_id: context._id});
	// switch to 1st parent or child
	if (someParent || someChild) {
		var newCtx = someParent || someChild;
		Session.set("contextId", newCtx);
	}
}
