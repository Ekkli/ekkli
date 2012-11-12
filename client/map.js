
Template.mapView.helpers({
    map: function() {
        return Maps.findOne({
            _id: Session.get("mapId")
        });
    },
    selectedStory: function() {
        var selectedStoryId = Session.get("selectedStory");
        if(selectedStoryId) {
            return Stories.findOne({
                _id: selectedStoryId
            });
        }
    }
});

var resolveSelectionRadius = function(story) {
    return story.type === "Story" ? 32 : 22;
};

Template.mapView.events({
    "click button#addStory": function(e) {
        e.preventDefault();
        var newStory = addStory(this._id, "", "Story", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#addSubStory": function(e) {
        e.preventDefault();
        var newStory = addStory(this._id, "", "SubStory", Session.get("selectedStory"));
        Session.set("selectedStory", newStory._id);
        d3.select("circle.callout")
            .attr('cx', newStory.x)
            .attr('cy', newStory.y)
            .attr("r", resolveSelectionRadius(newStory));
    },
    "click button#clear": function(e) {
        e.preventDefault();
        Stories.remove({
            mapId: this._id
        });
        Session.set("selectedStory","");
    },
    "mousedown circle": function(event, template) {
        Session.set("selectedStory", event.currentTarget.id);
        var selected = event.currentTarget.id;
        var selectedStory = selected && Stories.findOne({
            _id: selected
        });

        var callout = d3.select("circle.callout");
        if (selectedStory)
            callout.attr("cx", selectedStory.x )
                .attr("cy", selectedStory.y )
                .attr("r", resolveSelectionRadius(selectedStory))
                .attr("class", "callout")
                .attr("display", '');
        else
            callout.attr("display", 'none');
    },
    "dblclick .storyLabel": function(event, template) {
        event.preventDefault();
        var editor = d3.select(".storyEditor");
        editor.attr("x", event.srcElement.getAttribute("x"))
            .attr("y", event.srcElement.getAttribute("y") - 26)
            .attr("display", '');
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
                    var lines = d3.select('.paths').selectAll("line");
                    if (lines) {
                    _.forEach(lines[0], function(line) {
                        if (line.getAttribute('to') === d._id) {
                            line.setAttribute('x2', d.x);
                            line.setAttribute('y2', d.y);
                        } else if (line.getAttribute('from') === d._id) {
                            line.setAttribute('x1', d.x);
                            line.setAttribute('y1', d.y);
                        }
                    });}
                    d3.select('.labels').selectAll("text").attr("x", resolveTitleX).attr("y", resolveTitleY);
                    d3.select("circle.callout").attr('cx', d.x).attr('cy', d.y);
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

            var resolveX = function(story) {
                    return story.x;
                },
                resolveY = function(story) {
                    return story.y;
                },
                resolveRadius = function(story) {
                    return story.type === "Story" ? 30 : 20;
                },
                resolveTitleX = function(story) {
                    if (story.title) {
                        var titleWidth = story.title.length * 6;
                        return story.x - titleWidth / 2;
                    }
                    return 0;
                },
                resolveTitleY = function(story) {
                    return story.y + resolveRadius(story) + 12;
                };

            var links = [];
            _.forEach(stories, function(story) {
                var nextStories = _.filter(stories, function(linkedStory) {
                    return _.contains(story.nextStories, linkedStory._id);
                });
                _.forEach(nextStories, function(linkedStory) {
                    var link = {
                        from: story._id,
                        to: linkedStory._id,
                        x1: story.x,
                        y1: story.y,
                        x2: linkedStory.x,
                        y2: linkedStory.y
                    };
                    links.push(link);
                });
            });
            console.log(links);
            var x1 = function(d) { return d.x1 },
                y1 = function(d) { return d.y1 },
                x2 = function(d) { return d.x2 },
                y2 = function(d) { return d.y2 };

            d3.select('.paths').selectAll('line').remove();
            d3.select('.paths').selectAll('line').data(links)
                .enter()
                .append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('from', function(d) {return d.from})
                .attr('to', function(d) {return d.to})
                .attr("stroke", "#aaa")
                .attr("stroke-width", 5);

            svg.select('.circles').selectAll('circle').remove();
            svg.select('.circles').selectAll('circle').data(stories)
                .enter().append('circle')
                .attr('id', function(story) { return story._id })
                .attr('cx', resolveX)
                .attr('cy', resolveY)
                .attr('r', function(story){ return (story.type === "Story") ? 30 : 20 })
                .attr('class', 'circle')
                .call(dragCircle);

            d3.select('.circles').selectAll('circle')
                .attr('cx', resolveX)
                .attr('cy', resolveY);

            d3.select('.labels').selectAll('text').remove();
            d3.select('.labels').selectAll('text').data(stories)
                .enter().append('text')
                .attr("id", function(story) { return story._id; })
                .attr("class", "storyLabel")
                .attr('x', resolveTitleX)
                .attr('y', resolveTitleY)
                .text(function(story) { return story.title; });

            d3.select('.labels').selectAll('text')
                .attr('x', resolveTitleX)
                .attr('y', resolveTitleY);

        });
    }
};


Template.mapView.destroyed = function () {
    this.handle && this.handle.stop();
};