
Template.maps.helpers({
   maps: function() {
       return Maps.find({});
   }
});

Template.maps.events({
    "click button#addNewMap": function(e) {
        e.preventDefault();
        var mapName = $("#newMapName").val();
        var isPublic = $("#newMapIsPublic").attr("checked") ? true : false;
		createMap(mapName, isPublic, "");
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
    "click a": function(e) {
        e.preventDefault();
        Meteor.go(Meteor.mapPath({_id: this._id}), null);
    }
});
