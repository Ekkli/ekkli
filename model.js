
Maps = new Meteor.Collection("maps");
Stories = new Meteor.Collection("stories");

var addStory = function(toMap, title, storyType) {
    var map = Maps.findOne({
        _id: toMap
    });

    if(map) {
        var lastStory = Stories.findOne({
            mapId: map._id
        }, {
            sort: {
                _id: -1
            }
        });

        var storyCount = Stories.find().count();
        var nextX = lastStory ? lastStory.x + 70 : 40,
            nextY = lastStory ? lastStory.y : 40;

        var newStoryId = Stories.insert({
            mapId: map._id,
            title: title ? title : "Untitled Story" + (storyCount + 1),
            createdTime: new Date(),
            x: nextX,
            y: nextY,
            type: storyType,
            nextStories: []
        });

        if(lastStory) {
            Stories.update({
                _id: lastStory._id
            }, {
                $addToSet: {
                    nextStories: newStoryId
                }
            });
        }
    }
};