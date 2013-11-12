// add this function to meteor for call on clinet side
Meteor.methods({
    sendInvitation: function (to_emails, msg, map_id) {

        var to = to_emails.split(";");
        to.forEach(function(to_email){
                var invited_user = InvitedUsers.findOne({'emails.address':to_email,'map_id':map_id});
                if(!invited_user){
                    invited_user = add_invited_user(to_email,map_id);
                    console.log(invited_user);

                }


                console.log(Meteor.absoluteUrl()+"map/"+map_id+"/user_id/"+invited_user._id);

                var from = Meteor.user().profile.email;
                Email.send({
                    from: from,
                    to: to_email,
                    replyTo: from || undefined,
                    subject:from +" invited you to an Ekkli map",
                    text: "Hello "+to_email+",\n\n"+msg+"\n\nClick the following link to participate in this Ekkli Map:\n\n"
                        +Meteor.absoluteUrl()+"map/"+map_id+"/user_id/"+invited_user._id+"\n"
                });
            }
        )
    },
	addUserAchievement: function(achievement) {
		var user = Meteor.user();
		if (user && user.achievements) {
			user.achievements[achievement] = true;
			// TODO use $set
			Meteor.users.update({_id: Meteor.user()._id}, user);
		}
	},
	addUserBadge: function(badge) {
		var user = Meteor.user();
		if (user && user.badges) {
			Meteor.users.update({_id: Meteor.user()._id}, { $addToSet: { badges: badge } } );
		}
	},
    last_map_update:function last_map_update(dict) {
        console.log("map_id "+dict["mapId"]);
        console.log("current_time "+dict["current_time"]);
        var map_id = dict["mapId"];
        var time = dict["current_time"];
        //alert(map_id);
        var map = Maps.findOne({_id: map_id});
        map.last_update = time;
        Maps.update({_id:map_id}, map);
    },
	
	relate_user_to_map: function(user_id, map_id) {
		// add the user to the map's participants list
		Maps.update({_id:map_id},{$addToSet:{'participants':user_id}});
		console.log("Map participants updated");
		
		// add the map's context as a parent context to the user's context
		var map = Maps.findOne({_id: map_id}),
		    user = Meteor.users.findOne({_id: user_id});
		Contexts.update({_id: user.contextId}, {
			$addToSet: {parents: map.contextId}
		});
		console.log("added map context as parent to user context");
		Contexts.update({_id: map.contextId}, {
			$addToSet: {children: user.contextId}
		});
		console.log("added user context as child to map context");
	},
	
	upgrade_to_contexts: function() {
		console.log("Upgrading to contexts...");
		var contextByUser = {};
		
		// create context per user
		var users = Meteor.users.find().fetch();
		for (var i = 0; i < users.length; i++) {
			var u = users[i];
			console.log("Migrating " + u.username);
			if (u.contextId) {
				console.log("Oh, already having " + u.contextId);
				contextByUser[u._id] = u.contextId;
			}
			else {
				var name = u.username;
				if (u.profile) name = u.profile.name;
				var contextId = addContext(name, "Personal context of " + name, "Person", null, null);
				Meteor.users.update({_id: u._id}, {
					$set: {contextId: contextId}
				});
				console.log("Creating a new context " + contextId);
				contextByUser[u._id] = contextId;
			}
		}	
		
		// associate every map with a context
		var maps = Maps.find().fetch();
		for (i = 0; i < maps.length; i++) {
			var m = maps[i];
			console.log("Migrating map " + m.name);
			if (m.contextId) {
				console.log("Oh, already having " + m.contextId);
			}
			else {
				var ownerContextId = contextByUser[m.owner];
				if (ownerContextId) {
					Maps.update({_id: m._id}, {
						$set: {contextId: ownerContextId}
					});
					console.log("Setting context id of map to " + ownerContextId);
				}
				else {
					console.log("Map without owner, can't infer context then :(");
				}
			}
		}
		
		
		// associate invited users with a context
		
		
	}

});