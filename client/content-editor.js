
Template.content_editor.helpers({
    story_title: function() {
        var story = Stories.findOne({_id: Session.get("selectedStory")});
        if (story && story.title) {
            return story.title;
        }
        return "";
    },
    story_content: function() {
        var story = Stories.findOne({_id: Session.get("selectedStory")});
        if (story && story.content) {
            return story.content;
        }
        return "";
    }
});

Template.content_editor.events({
  "click button#save-content": function(event) {
    saveContent($("#edit-title-input").val(), $("#edit-content-input").val());
  }
});



function saveContent(title, content) {
    var story_id = Session.get("selectedStory");
    var story = Stories.findOne({_id: story_id});
    if (story) {
		story.title = title;
        story.content = content;
        Stories.update({_id: story_id}, story);
    }
}
