
Template.mapView.helpers({
    map: function() {
        return Maps.findOne({
            _id: Session.get("mapId")
        });
    },
});

Template.mapView.events({
    "click button#addStory": function(e) {
        e.preventDefault();
        var map = Maps.findOne({
            _id: this._id
        });

        if(map) {
            var lastStory = Stories.findOne({
                mapId: map._id
            }, {
                sort: {
                    createdTime: -1
                }
            });

            var storyCount = Stories.find().count();

            var newStoryId = Stories.insert({
                mapId: map._id,
                title: "Untitled Story" + (storyCount + 1),
                x: storyCount * 30,
                y: 40,
                type: "Story",
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
    },
    "click button#clear": function(e) {
        e.preventDefault();
        Stories.remove({
            mapId: this._id
        });
    }
});

Template.mapView.rendered = function() {
    var self = this;
    var svg = d3.select('body').select('#vis');

    if (!self.handle) {
        self.handle = Meteor.autorun(function () {
            var stories = Stories.find().fetch();

            var dragCircle = d3.behavior.drag()
                .on('dragstart', function(){
                    d3.event.sourceEvent.stopPropagation();
                })
                .on('drag', function(d,i){
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    d3.select(this).attr('cx', d.x).attr('cy', d.y);
                    d3.select('.paths').selectAll("path").attr("d", line);
                })
                .on('dragend', function(d,i) {
                    Stories.update({
                        _id: d._id
                    }, {
                        $set: {
                            x:d.x,
                            y:d.y
                        }
                    });
                });


            var line = d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; });

            svg.select('.paths').selectAll('path').data([stories])
                .enter()
                .append("path")
                .attr("fill", "transparent")
                .attr("stroke", "#aaa")
                .attr("stroke-width", 5);

            d3.select('.paths').selectAll("path").attr("d",line);

            svg.select('.circles').selectAll('circle').data(stories)
                .enter().append('circle')
                .attr('cx', function(story){ return story.x })
                .attr('cy', function(story){ return story.y })
                .attr('r', function(story){ return (story.type === "Story") ? 30 : 20 })
                .attr('class', 'circle')
                .call(dragCircle);

            d3.select('.circles').selectAll('circle')
                .attr('cx', function(s) {return s.x})
                .attr('cy', function(s) {return s.y});
        });
    }
};


Template.mapView.destroyed = function () {
    this.handle && this.handle.stop();
};