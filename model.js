
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

        title = title ? title : "Untitled Story" + (storyCount + 1);

        var newStoryId = Stories.insert({
            mapId: map._id,
            title: title,
			author: getCurrentUserName(),
            createdTime: new Date(),
            x: nextX,
            y: nextY,
            type: storyType,
            nextStories: []
        });

        if(lastStory) {
            console.log("linking: "+ lastStory.title + "->" +title);
            Stories.update({
                _id: lastStory._id
            }, {
                $addToSet: {
                    nextStories: newStoryId
                }
            });
        }
        return Stories.findOne({
            _id: newStoryId
        });
    }
};


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





