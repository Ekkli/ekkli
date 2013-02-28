
Template.content_editor.helpers({
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
    saveContent($("#edit-content-input").val());
  }
});



function saveContent(content) {
    var story_id = Session.get("selectedStory");
    var story = Stories.findOne({_id: story_id});
    if (story) {
        story.content = content;
        Stories.update({_id: story_id}, story);
    }
}
