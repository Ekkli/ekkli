
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
   }
});

Template.maps.events({
    "click button#addNewMap": function(e) {
        e.preventDefault();
        var map_name = $("#newMapName").val();
        var is_public = $("#newMapIsPublic").attr("checked") ? true : false;
		createMap(map_name, is_public, "");
    },
	"click .select-which-maps": function(e) {
		var which = $(e.target).attr("which");
		Session.set(	"whichMaps", which);
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
	}
});

Template.mapListItem.events({
	"click .delete-map-action": function(e) {
		e.preventDefault();
		if (confirm("Are you sure you wish to delete the discussion: " + this.name + "?")) {
			deleteMap(this._id);
		}
	}
});
