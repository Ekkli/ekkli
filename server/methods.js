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
    }

});