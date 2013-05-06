
var getSelectedStory = function() {
	if (Session.get("selectedStory")) {
		var story = Stories.findOne({_id: Session.get("selectedStory")});
		if (story) return story;
	}
	return null;
}

var saveContent = function(title, content) {
	var story = getSelectedStory();
	if (story) {
		story.title = title;
		story.content = content;
		Stories.update({_id: Session.get("selectedStory")}, story);
		console.log("done");	
	}	
}




Template.opinion_display.events({
	"click .delete-opinion": function() {
		delete_opinion(this._id);	
	},
	"click .edit-opinion": function() {
		Session.set("show_opinion_actions", "");
		Session.set("opinion_edited", this._id);
	},
	"click .opinion-text": function(e) {
		if (Session.equals("show_opinion_actions", this._id)) {
			Session.set("show_opinion_actions", "");
		}
		else {
			Session.set("show_opinion_actions", this._id);	
		}
	},
	"keypress input#edit-existing-opinion-input": function(e) {
		var $el = $(e.target);
		if (e.which === 13) {
			var opinion = $el.val();
			update_opinion(this._id, opinion);
		}
		else {
			$el.tooltip();
		}
	},
	"keyup input#edit-existing-opinion-input": function(e) {
		if (e.keyCode === 27) {
			Session.set("opinion_edited", "");
		}	
	}
});

Template.opinion_display.helpers({
	show_opinion_actions: function() {
		return Session.equals("show_opinion_actions", this._id);	
	},
	editing_opinion: function() {
		return Session.equals("opinion_edited", this._id);
	}
});

Template.map.helpers({
    map: function() {
        return Maps.findOne({
            _id: Session.get("mapId")
        });
    },
    selectedStory: getSelectedStory,
	story_title: function() {
		var story = getSelectedStory();
		if (story) {
			return story.title;
		}
		return "";
	},
	story_content: function() {
		var story = getSelectedStory();
		if (story) {
			return story.content;
		}
		return "";	
	},
	content_side_bar_shown: function() {
		return Session.get("content_side_bar_shown");	
	},
   stories_loading: function() {
		return !Session.equals("stories_loaded", true);
   },
   opinions: function() {
		return Opinions.find().fetch();
   },
   opinions_loading: function() {
		return !Session.equals("opinions_loaded", true);
   },
   number_of_opinions: function() {
		return Opinions.find().count();
   },
   author_name: function() {
		var name = getCurrentUserName();
		return (name) ? name + ":" : "";
   }
    /*,
	story_author: function() {
		var story = getSelectedStory();
		if (story) {
			return story.author;
		}
		return "";	
	}*/
});

var resolveRadius = function(story) {
    return story.type === "Story" ? 14 : 8;
};

var resolveSelectionRadius = function(story) {
    return resolveRadius(story) + 2;
};

function handleContentClick(story) {
    selectStory(story._id);
    $("#editContent").click();
}

function selectStory(id) {
    Session.set("selectedStory", id);
	Session.set("content_side_bar_shown", true);
	Session.set("opinions_loaded", false);
    var selected = id;
    var selectedStory = selected && Stories.findOne({
        _id:selected
    });

    var callout = d3.select("circle.callout");
    if (selectedStory)
        callout.attr("cx", selectedStory.x)
            .attr("cy", selectedStory.y)
            .attr("r", resolveSelectionRadius(selectedStory))
            .attr("class", "callout")
            .attr("display", '');
    else
        callout.attr("display", 'none');
}

function handle_story_selection(event) {
	selectStory(event.currentTarget.id);
 	if (Session.get("creating_link_from")) {
		add_link(event.currentTarget.id, Session.get("creating_link_from"));
		$("#addLink").popover('hide');
	}	
}

Template.map.events({

    "mousedown circle": handle_story_selection,
    "mousedown .storyLabel": handle_story_selection,
    "dblclick .storyLabel": function(event, template) {
        event.preventDefault();
        var editor = d3.select(".storyEditor");
        editor.attr("x", event.srcElement.getAttribute("x"))
            .attr("y", event.srcElement.getAttribute("y") - 26)
            .attr("display", '');
    },
    "click button#save-content": function(event) {
        saveContent($("#edit-title-input").val(), $("#edit-content-input").val());
    },
	"click .close-side-bar": function() {
		Session.set("content_side_bar_shown", false);
	},
	"keypress input#edit-opinion-input": function(e) {
		if (e.which === 13) {
			var $el = $(e.target);
			var opinion = $el.val();
			add_opinion(Session.get("mapId"), Session.get("selectedStory"), null, opinion, null);	
			$el.val("");
		}
	},
	"click .open-content-side-bar": function() {
		console.log("opening");
		Session.set("content_side_bar_shown", true);
	},
	"click .delete-story": function() {
		var story = getSelectedStory();
		if (story) {
			if (confirm("Are you sure you want to delete the story: " + story.title)) {
				delete_story(story);
			}
		}
	}

});

Template.map.rendered = function() {
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

                resolveContentX = function(story) {
                    if (story.title) {
                        var contentWidth = 20;
                        return story.x - contentWidth / 2;
                    }
                    return 0;
                },
                resolveContentY = function(story) {
                    return story.y + 50;
                },
                resolveFillByContent = function(story) {
					var content_exists = false;
					if (story.content) content_exists = true;
					if (story.has_opinions) content_exists = true;
                    if (content_exists) {
                        return "navy";
                    }
                    else {
                        return "white";
                    }
                }



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

            svg.select('.stories').selectAll('circle').remove();
            svg.select('.stories').selectAll('circle').data(stories)
                .enter().append('circle')
                .attr('id', function(story) { return story._id })
                .attr('cx', resolveX)
                .attr('cy', resolveY)
                .attr('r', resolveRadius)
                .attr('class', 'circle')
				.attr('fill', resolveFillByContent)
                .call(dragCircle);

            d3.select('.stories').selectAll('circle')
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
/*
            d3.select('.contents').selectAll('rect').remove();
            d3.select('.contents').selectAll('rect').data(stories)
                .enter().append('rect')
                .attr("id", function(story) { return "content-" + story._id; })
                .attr("class", "story-content")
                .attr('x', resolveContentX)
                .attr('y', resolveContentY)
                .attr('width', 20)
                .attr('height', 10)
                .attr('fill', resolveFillByContent)
                .on('click', handleContentClick);
*/
        });
    }
};


Template.map.destroyed = function () {
    this.handle && this.handle.stop();
};
