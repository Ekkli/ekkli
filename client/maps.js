
deleteMap = function(map_id) {
	var map = Maps.findOne({_id: map_id});
	map.is_deleted = true;
	Maps.update({_id: map_id}, map);	
}


Template.maps.helpers({
   maps: function() {
       return Maps.find({});
   },
   maps_loading: function() {
		if (Session.get("maps_loaded")) {
			return false;
		}
		return true;
   },

   mine_selected: function() { return Session.equals("whichMaps", "mine"); },
   own_selected: function() { return Session.equals("whichMaps", "own"); },
   participate_selected: function() { return Session.equals("whichMaps", "participate"); },
   public_selected: function() { return Session.equals("whichMaps", "public"); },
   recent_selected: function() { return Session.equals("whichMaps", "recent"); },
   deleted_selected: function() { return Session.equals("whichMaps", "deleted"); }
});

Template.maps.events({
    "click button#addNewMap": function(e) {
        alert(e);
        e.preventDefault();
        var map_name = $("#newMapName").val();
        var is_public = $("#newMapIsPublic").attr("checked") ? true : false;
		createOrUpdateMap(null,map_name, is_public, "");
    },
	"click .select-which-maps": function(e) {
		var which = $(e.target).attr("which");
		Session.set("whichMaps", which);
		amplify.store("whichMaps", which);
	}
});

Template.mapListItem.helpers({
	created_at_date: function() {
		if (this.created_at) {
			var d = this.created_at.getDate() + "." + (this.created_at.getMonth() + 1) + "." + this.created_at.getFullYear();
			return d;
		}
		return "";	
	},
	created_at_time: function() {
		if (this.created_at) {
			var minutes_padding = (this.created_at.getMinutes() < 10) ? "0" : "";
			var t = this.created_at.getHours() + ":" + minutes_padding + this.created_at.getMinutes();
			return t;
		}
		return "";
	},
	last_update_date: function() {
		if (this.created_at) {
			var d = this.last_update.getDate() + "." + (this.last_update.getMonth() + 1) + "." + this.last_update.getFullYear();
			return d;
		}
		return "";	
	},
	last_update_time: function() {
		if (this.created_at) {
			var minutes_padding = (this.last_update.getMinutes() < 10) ? "0" : "";
			var t = this.last_update.getHours() + ":" + minutes_padding + this.last_update.getMinutes();
			return t;
		}
		return "";
	},
	action_delivered_percent: function() {
		return ((this.count_ACTION_DELIVERED + this.count_ACTION_TESTS_PASS) / this.count_ACTION) * 100;
	},
	action_started_percent: function() {
		return (this.count_ACTION_STARTED / this.count_ACTION) * 100;
	},
	action_accepted_percent: function() {
		return (this.count_ACTION_ACCEPTED / this.count_ACTION) * 100;
	},
	action_cancelled_percent: function() {
		return ((this.count_ACTION_CANCELLED + this.count_ACTION_TESTS_FAIL) / this.count_ACTION) * 100;
	},
	result_met_percent: function() {
		return (this.count_RESULT_MET / this.count_RESULT) * 100;
	},
	result_expected_percent: function() {
		return (this.count_RESULT_EXPECTED / this.count_RESULT) * 100;
	},
	result_missed_percent: function() {
		return (this.count_RESULT_MISSED / this.count_RESULT) * 100;
	}
});

Template.mapListItem.events({
	"click .delete-map-action": function(e) {
		e.preventDefault();
		if (confirm("Are you sure you wish to delete the map: " + this.name + "?")) {
			deleteMap(this._id);
		}
	},
    "click .edit-map-action": function(e) {
        e.preventDefault();
        Session.set("mapId", this._id);
    }

});


Deps.autorun(function (c) {
    var dict = Session.get('last_map_update');

    if(undefined != dict){
        Meteor.call('last_map_update',dict);
    }
});

