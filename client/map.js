getSelectedStory = function() {
	if (Session.get("selectedStory")) {
		var story = Stories.findOne({_id: Session.get("selectedStory")});
		if (story) return story;
	}
	return null;
}

saveContent = function(title, content) {
	var story = getSelectedStory();
	if (story) {
		story.title = title;
		story.content = content;
		Stories.update({_id: Session.get("selectedStory")}, story);
		console.log("done");	
	}	
}

save_story_field = function(story_id, field_name, field_value, callback) {
	var story = Stories.findOne({_id: story_id});
	if (story) {
		story[field_name] = field_value;
		Stories.update({_id: story_id}, story);
	}
	else {
		console.log("Error: trying to update a field of a non-existing story " + story_id);
	}
	if (callback)
		callback();
}


get_story_field = function(story_id, field_name) {
	var story = Stories.findOne({_id: story_id});
	if (story) {
		return story[field_name];
	}
	else {
		return "";
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
	"keyup input#edit-existing-opinion-input": function(e) {
		if (e.which === 13) {
			update_opinion(this._id, $("#edit-existing-opinion-input").val());
		}
		else if (e.keyCode === 27) {
			Session.set("opinion_edited", "");
		}	
		else {
			$("#edit-existing-opinion-input").tooltip();
		}
	},
	"click #save-existing-opinion": function() {
		update_opinion(this._id, $("#edit-existing-opinion-input").val());
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
    author_name: function() {
        var story = getSelectedStory();
        if (story) {
            return story.author_name;
        }
        return "";
    },
    author_avatar:function() {
        var story = getSelectedStory();
        if (story) {
            var email = story.author_email;
            var size=32;

            return Gravatar.imageUrl(email)

        }



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
   },
   editing_title: function() {
	   return Session.equals("editing_title", true);
   },
   editing_content: function() {
	   return Session.equals("editing_content", true);
   },
   adding_opinion: function() {
	   return Session.equals("adding_opinion", true);
   },
   
    /*,
	story_author: function() {
		var story = getSelectedStory();
		if (story) {
			return story.author;
		}
		return "";	
	}*/
});

resolveRadius = function(story) {
    return story.type === "Story" ? 12 : 6;
};

resolveSelectionRadius = function(story) {
    return resolveRadius(story) + 2;
};

handleContentClick=function (story) {
    selectStory(story._id);
    $("#editContent").click();
}

selectStory=function (id) {
    Session.set("selectedStory", id);
	Session.set("content_side_bar_shown", true);
	Session.set("opinions_loaded", false);
	Session.set("editing_title", false);
	Session.set("editing_content", false);
	Session.set("editing_opinion", false);
	Session.set("adding_opinion", false);
	
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

handle_story_selection=function (event) {
	selectStory(event.currentTarget.id);
 	if (Session.get("creating_link_from")) {
		add_link(Session.get("creating_link_from"), event.currentTarget.id);
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
	"keyup input#edit-title-input": function(e) {
		if (!Session.equals("editing_title", true)) {
			Session.set("editing_title", true);
		}
		else {
			if (e.which === 13) {
				save_story_field(Session.get("selectedStory"), "title", $("#edit-title-input").val(), 
								 function() { Session.set("editing_title", false); });
			}
			else if (e.keyCode === 27) {
				Session.set("editing_title", "");
				$("#edit-title-input").val(get_story_field(Session.get("selectedStory"), "title"));
			}	
		}
	},
    "click button#save-story-title": function(event) {
		save_story_field(Session.get("selectedStory"), "title", $("#edit-title-input").val(), 
					     function() { Session.set("editing_title", false); });
    },
	"keyup textarea#edit-content-input": function(e) {
		if (!Session.equals("editing_content", true)) {
			Session.set("editing_content", true);
		}
		// else {
		// 	if (e.which === 13) {
		// 		save_story_field(Session.get("selectedStory"), "content", $("#edit-content-input").val(), 
		// 						 function() { Session.set("editing_content", false); });
		// 	}
		// 	// TODO handle escape (cancells edit)
		// }
	},
    "click button#save-story-content": function(event) {
		save_story_field(Session.get("selectedStory"), "content", $("#edit-content-input").val(), 
					     function() { Session.set("editing_content", false); });
    },
	"keyup input#edit-opinion-input": function(e) {
		if (!Session.equals("adding_opinion", true)) {
			Session.set("adding_opinion", true);
		}
		if (e.which === 13) {
			add_opinion(Session.get("mapId"), Session.get("selectedStory"), null, $(e.target).val(), null, function() { $(e.target).val(""); });	
		}
		if (e.keyCode === 27) {
			$("#edit-opinion-input").val();
			Session.set("adding_opinion", "");
		}	
	},
    "click button#save-new-opinion": function(event) {
		add_opinion(Session.get("mapId"), Session.get("selectedStory"), null, $("#edit-opinion-input").val(), null, function() { $("#edit-opinion-input").val(""); });	
    },	
	"click .open-content-side-bar": function() {
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
	var LABEL_WIDTH = 60;

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
                        var titleWidth = LABEL_WIDTH;
                        return story.x - titleWidth / 2;
                    }
                    return 0;
                },
                resolveTitleY = function(story) {
                    return story.y + resolveRadius(story) + 5;
                },
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


			var story_by_id = {};
			 _.forEach(stories, function(story) {
            		story_by_id[story._id] = story;
			});
            var links = [];
            _.forEach(stories, function(story) {
				if (story) {
				for (var i = 0; i < story.nextStories.length; i++) {
					var linkedStory = story_by_id[story.nextStories[i]];
					if (linkedStory) {
					var link_color = story.nextStoriesLinks[i].color;
                    var link = {
                        from: story._id,
                        to: linkedStory._id,
                        x1: story.x,
                        y1: story.y,
                        x2: linkedStory.x,
                        y2: linkedStory.y,
						color: link_color
                    };
                    links.push(link);
					}
                };
				}
            });
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
                .attr("stroke", function(d) {return d.color})
                .attr("stroke-width", 8);
/*
            d3.select('.paths').selectAll('path').remove();
            d3.select('.paths').selectAll('path').data(links)
                .enter()
                .append('path')
                .attr('d', function(d) {
					var p = "M" + d.x1 + "," + d.y1 + " ";
					var dx = (d.x2>d.x1) ? d.x2-10 : d.x1-10;
					var dy = (d.y2>d.y1) ? d.y2-10 : d.x1-10;
					var cx = (d.x2>d.x1) ? d.x2 : d.x1;
					var cy = (d.y2>d.y1) ? d.y2 : d.x1;
					p += "Q" + (cx-dx) + "," + (cy-dy) + " ";
					p += d.x2 + "," + d.y2;
					return p;
				})
                .attr('from', function(d) {return d.from})
                .attr('to', function(d) {return d.to})
                .attr("stroke", function(d) {return d.color})
                .attr("stroke-width", 8)
				.attr("fill", "white");
*/

            d3.select('.stories').selectAll('circle').remove();
            d3.select('.stories').selectAll('circle').data(stories)
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
				

	            d3.select('.labels').selectAll('.storyLabel').remove();
	            d3.select('.labels').selectAll('foreignObject').data(stories)
	                .enter().append('foreignObject')
	                .attr("id", function(story) { return story._id; })
					.attr("class", "storyLabel")
	                .attr('x', resolveTitleX)
	                .attr('y', resolveTitleY)
					.attr('height', 60)
					.attr('width', LABEL_WIDTH)
					.append("xhtml:p")
						.style("text-align","center")
						.style("font-size", "10px")
						.style("line-height", "85%")
					    .html(function(story) { return story.title; })
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
