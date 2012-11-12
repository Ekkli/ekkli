
Maps = new Meteor.Collection("maps");
Stories = new Meteor.Collection("stories");

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