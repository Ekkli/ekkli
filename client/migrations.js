

Template.migrations.helpers({
	results: function() {
		return Session.get("migration_results");
	}
});


Template.migrations.events({
	"click #upgrade_to_contexts": function() {
		Session.set("migration_results", "Upgrading to contexts...");
		Meteor.call("upgrade_to_contexts", function(ret) {
			Session.set("migration_results", "done.");
		});
	}
})