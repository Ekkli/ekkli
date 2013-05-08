
Maps = new Meteor.Collection("maps");
Stories = new Meteor.Collection("stories");
Opinions = new Meteor.Collection("opinions");


function getCurrentUserName() {
	if (Meteor.user()) {
		if (Meteor.user().profile) {
			return Meteor.user().profile[0].name;
		}
		else {
			return Meteor.user().username;
		}
	}
	return "";
}

function resolve_link_color(parent) {
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

var addStory = function(toMap, title, storyType, parent) {
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

        title = title ? title : "Untitled " + (storyCount + 1);

        var newStoryId = Stories.insert({
            mapId: map._id,
            title: title,
			author: getCurrentUserName(),
            createdTime: new Date(),
            x: nextX,
            y: nextY,
            type: storyType,
            nextStories: [],
			nextStoriesLinks: []
        });

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


var delete_story = function(story) {
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
	// change the selected story
	if (some_prev || next_story) {
		var newly_selected_story = next_story || some_prev;
		selectStory(newly_selected_story._id);
	}
	
	// TODO log the deletion in the map activity stream
}

var add_opinion = function(to_map, to_story, in_reply_to, opinion, speech_act) {
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
};

function update_opinion(opinion_id, text) {
	var opinion = Opinions.findOne({_id: opinion_id});
	if (opinion) {
		opinion.text = text;
		Opinions.update({_id: opinion_id}, opinion);
		Session.set("opinion_edited", "");
	}		
}

function delete_opinion(opinion_id) {
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


function add_link(from_story_id, to_story_id) {
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




