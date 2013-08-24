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
	}	
}

save_story_field = function(story_id, field_name, field_value, callback) {
	var story = Stories.findOne({_id: story_id});
	if (story) {
		story[field_name] = field_value;
		Stories.update({_id: story_id}, story);
	}
	else {
		console.log("Error: trying to update a field of a non-existing element " + story_id);
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

count_opinions_by_speech_act = function(speech_act) {
	var opinions = Opinions.find().fetch();
	var count = 0;
	opinions.forEach(function(op) {
		if (op.speech_act === speech_act) count++;
	})
	return count;
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
	},
	author_name_label: function() {
		if (this.author_name) {
			return this.author_name + ":";
		}
		else {
			return "";
		}
	}
});


Template.map.helpers({
    map: function() {
        return Maps.findOne({
            _id: Session.get("mapId")
        });
    },
    author_name_label: function() {
        var story = getSelectedStory();
        if (story) {
            return story.author_name;
        }
        return "";
    },
    author_avatar:function() {
        var story = getSelectedStory();
        if (story) {
            if (story.picture_url){
                return story.picture_url;
            }
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
   number_of_positive_opinions: function() {
		var story = getSelectedStory();
		if (story && story.voting_counts) {
			return story.voting_counts["POSITIVE"];
		}
		return count_opinions_by_speech_act("POSITIVE");
   },
   number_of_negative_opinions: function() {
		var story = getSelectedStory();
		if (story && story.voting_counts) {
			return story.voting_counts["NEGATIVE"];
		}
	   return count_opinions_by_speech_act("NEGATIVE");
   },
   number_of_warning_opinions: function() {
		var story = getSelectedStory();
		if (story && story.voting_counts) {
			return story.voting_counts["WARNING"];
		}
	   return count_opinions_by_speech_act("WARNING");
   },
		//    author_name_label: function() {
		 //var name = getCurrentUserName();
		// return (name) ? name + ":" : "";
		//    },
   editing_title: function() {
	   return Session.equals("editing_title", true);
   },
   editing_content: function() {
	   return Session.equals("editing_content", true);
   },
   adding_opinion: function() {
	   return Session.equals("adding_opinion", true);
   },
   has_next_action: function() {
	var story = getSelectedStory();
	if (story) {
		var status_key = story.lifecycle_status;
   	 	return lifecycle_statuses_for(story.type)[status_key].action !== null;
	}
   },
   next_action: function() {
	var story = getSelectedStory();
	if (story) {
		var status_key = story.lifecycle_status;
   	 	return lifecycle_statuses_for(story.type)[status_key].action;
	}
   },
   current_status: function() {
		var story = getSelectedStory();
		if (story) {
			var status_key = story.lifecycle_status;
	   	 	return lifecycle_statuses_for(story.type)[status_key];
		}
   },
   life_cycle_statuses: function() {
		var story = getSelectedStory();
		if (story) {	
			var lifecycle = lifecycle_statuses_for(story.type);
			var statuses = _.values(lifecycle),
				keys = _.keys(lifecycle);		
			for (var i = 0; i < statuses.length; i++) {
				statuses[i].key = keys[i];
			}
			return statuses;
		}
   },
   editing_status: function() {
	   return Session.get("editing_status") === true;
   },
   participants: function() {
        return Meteor.users.find().fetch();
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

resolveRadius = function(story) {
    return story.type === "RESULT" ? 12 : 6;
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
	Session.set("editing_status", false);
	Session.set("reverting_story_selection", false);
	
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
	if (Session.get("editing_title") || Session.get("editing_content") || Session.get("editing_opinion")) {
		Session.set("reverting_story_selection", true);
		if (confirm("You've made some changes, please save them before moving on")) {
			event.preventDefault();	// not 
			// event.stopPropagation(); // helping
			return;
		}
	}
	else {
		$("#edit-title-input").blur();
		$("#edit-content-input").blur();
	}
	var selectedStoryId = event.currentTarget.id;
	selectStory(selectedStoryId);
 	if (Session.get("creating_link_from")) {
		add_link(Session.get("creating_link_from"), selectedStoryId);
		Session.set("created_link_done", true);
		$("#addLink").popover('hide');
		
		if (typeof basicsTutorial != 'undefined') {
			basicsTutorial.createLink();
		}
	}
	
	
	if (typeof basicsTutorial != 'undefined') {
	
		if (basicsTutorial.current !== "LinkCreated" && basicsTutorial.current !== "TutorialFinished") {
			if (Session.get("basics_tutorial_fork_action_id")) {
				if (selectedStoryId === Session.get("basics_tutorial_fork_action_id")) {
					Session.set("selected_fork_story_done", true);
					basicsTutorial.selectForkAction();
				}
				else {
					basicsTutorial.selectNotForkAction();
				}
			}
			else if (Session.get("basics_tutorial_first_action_id")) {
				if (selectedStoryId === Session.get("basics_tutorial_first_action_id")) {
					Session.set("selected_previous_story_done", true);
					basicsTutorial.selectFirstAction();
				}
				else {
					basicsTutorial.selectNotFirstAction();
				}
			}
		}
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
				Session.set("edited_story_title_done", true);
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
		Session.set("edited_story_title_done", true);
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
			if ($("#edit-opinion-input").val() !== "")
				add_opinion(Session.get("mapId"), Session.get("selectedStory"), null, $(e.target).val(), "NOT_CLASSIFIED", function() { $(e.target).val(""); });	
		}
		if (e.keyCode === 27) {
			$("#edit-opinion-input").val();
			Session.set("adding_opinion", "");
		}	
	},
    "click button#save-new-opinion": function(event) {
		if ($("#edit-opinion-input").val() !== "")
			add_opinion(Session.get("mapId"), Session.get("selectedStory"), null, $("#edit-opinion-input").val(), "NOT_CLASSIFIED", function() { $("#edit-opinion-input").val(""); });	
    },	
	"click .open-content-side-bar": function() {
		Session.set("content_side_bar_shown", true);
	},
	"click .delete-story": function() {
		var story = getSelectedStory();
		if (story) {
			if (confirm("Are you sure you want to delete the " + story.type + ": " + story.title)) {
				delete_story(story);
			}
		}
	},
	"click .add-classified-opinion": function(e) {
		var DEFAULT_SPEECH_ACT_TEXTS = {
			POSITIVE: "I'm for this (click to edit why)",
			NEGATIVE: "I'm against this (click to edit why)",
			QUESTION: "I have a question (click to edit)",
			ANSWER: "I have an answer (click to edit)",
			WARNING: "I have a warning (click to edit)",
			FLAG: "I have a flag to raise (click to edit)",
		}
		var $el = $(e.target);
		if (!$el.is("a")) $el = $el.parent();
		var speech_act = $el.attr("speech-act");
		var default_text = DEFAULT_SPEECH_ACT_TEXTS[speech_act];
		add_opinion(Session.get("mapId"), Session.get("selectedStory"), null, default_text, speech_act);
	},
	"click #next-status-action": function() {
		var story = getSelectedStory();
		if (story) {
			var status_key = story.lifecycle_status;
			var status = lifecycle_statuses_for(story.type)[status_key];
			var next_status = lifecycle_statuses_for(story.type)[status.next];
			//if (next_status && confirm("This will set the status to " + next_status.name)) {
			if (next_status) {
				Session.set("advanced_status_done", true);
				update_story_status(story, status.next);
			}
		}
	},
	"click #current-status": function() {
		Session.set("editing_status", true);
	},
	"change #edit-status-input": function() {
		var story = getSelectedStory();
		if (story) {
			var next_status = $("#edit-status-input").val(); // NEED THE KEY, NOT VALUE
			if (confirm("This will set the status to " + next_status)) {
				update_story_status(story, next_status);
			}
		}
	},
	"click #cancel-edit-status": function() {
		Session.set("editing_status", false);
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
					if (Session.get("reverting_story_selection")) return;
                    d3.event.sourceEvent.stopPropagation();
                })
                .on('drag', function(d,i){
					if (Session.get("reverting_story_selection")) return;
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
					if (Session.get("reverting_story_selection")) return;
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
				resolveVotingIndicatorY = function(story) {
					return resolveTitleY(story) - 3;
				},
				resolveContentDimensions = function(story) {
					return resolveRadius(story);
				},
                resolveContentX = function(story) {
                    if (story.title) {
                        var contentWidth = resolveContentDimensions(story);
                        return story.x - contentWidth / 2;
                    }
                    return 0;
                },
                resolveContentY = function(story) {
					var contentHeight = resolveContentDimensions(story);
                    return story.y - contentHeight / 2;
                },
				resolveContentFontSize = function(story) {
					return (story.type === "RESULT") ? "2px" : "1px";
				},
                resolveFillByContent = function(story) {
					var content_exists = false;
					if (story.content) content_exists = true;
					if (story.has_opinions) content_exists = true;
                    if (content_exists) {
                        return "black";
                    }
                    else {
                        return "grey";
                    }
                },
                resolveFillByStatus = function(story) {
					var status_key = story.lifecycle_status;
					var status = lifecycle_statuses_for(story.type)[status_key];
					
                    if (status.color) {
                        return status.color;
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
				.attr('fill', resolveFillByStatus)
				.attr('stroke', resolveFillByContent)
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
					
					
		    var votes = [];
		    _.forEach(stories, function(story) {
					if (story) {
						if (story.voting_counts) {
							var p = story.voting_counts.POSITIVE,
								n = story.voting_counts.NEGATIVE,
								w = story.voting_counts.WARNING,
								t = p + n + w,
								x = story.x,
								y = story.y,
								total_width = LABEL_WIDTH;
						
							if (t > 0) {
								p = (p / t) * 100;
								n = (n / t) * 100;
								w = (w / t) * 100;
								var pw = (p / 100) * total_width;
								var nw = (n / 100) * total_width;
								var ww = (w / 100) * total_width;
								var curr_x = resolveTitleX(story);

								if (p > 0) {
									votes.push({
										id: "voting-positive-" + story._id,
										x: curr_x,
										y: resolveVotingIndicatorY(story),
										w: pw,
										color: "green"
									});
									curr_x += pw;
								}
								if (n > 0) {
									votes.push({
										id: "voting-negative-" + story._id,
										x: curr_x,
										y: resolveVotingIndicatorY(story),
										w: nw,
										color: "red"
									});
									curr_x += nw;
								}
								if (w > 0) {
									votes.push({
										id: "voting-warning-" + story._id,
										x: curr_x,
										y: resolveVotingIndicatorY(story),
										w: ww,
										color: "yellow"
									});
									curr_x += ww;
								}

							}
						}

		        	}
			});
					
					
		    d3.select('.voting-indicators').selectAll('rect').remove();
		    d3.select('.voting-indicators').selectAll('rect').data(votes)
	            .enter().append('rect')
	            .attr("id", function(vote) { return vote.id; })
	            .attr("class", "story-voting-indicator")
	            .attr('x', function(vote) { return vote.x; })
	            .attr('y', function(vote) { return vote.y; })
	            .attr('width', function(vote) { return vote.w; })
	            .attr('height', 2)
	            .attr('fill', function(vote) { return vote.color; });
	            // .on('click', handleContentClick);


					/*	Disturbs story selection
			d3.select('.content-indicators').selectAll('.storyContent').remove();
			d3.select('.content-indicators').selectAll('.storyContent').data(stories)
				.enter().append('foreignObject')
				.attr('id', function(story) { return 'story-content-' + story._id; })
				.attr('class', 'storyContent')
	            .attr('x', resolveContentX)
	            .attr('y', resolveContentY)
				.attr('height', resolveContentDimensions)
				.attr('width', resolveContentDimensions)
				.append("xhtml:p")
					.style("text-align","center")
					.style("font-size", resolveContentFontSize)
					.style("line-height", "100%")
					.html(function(story) { return story.content; })
					*/
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
					
			$("#vis").svgPan('map_viewport');
        });
    }
};


Template.map.destroyed = function () {
    this.handle && this.handle.stop();
};


Template.participant_display.helpers({
    participant_avatar: function(user) {
        if (user.profile.picture)
            return user.profile.picture;
        else
            return Gravatar.imageUrl(user.profile.email);
    }

});

