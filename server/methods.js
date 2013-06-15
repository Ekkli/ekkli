// add this function to meteor for call on clinet side
Meteor.methods({
    sendInvitation: function (to_emails, msg) {

        var to = to_emails.split(";");
        to.forEach(function(to_email){
                var invited_user = Meteor.users.findOne({'emails.address':to_email});
                if(!invited_user){
                    invited_user = add_invited_user(to_email);

                }


                console.log(Meteor.absoluteUrl()+invited_user._id);

                Email.send({
                    from: Meteor.user().emails[0].address,
                    to: to_email,
                    replyTo: Meteor.user().emails[0].address || undefined,
                    subject: Meteor.user().emails[0].address +" invite you to discussion",
                    text: "Hello "+to_emails+",\n\n"+msg+"You are invited to participate in the discussion!\n\n"
                        +Meteor.absoluteUrl()+invited_user._id+"\n"
                });
            }
        )
    }

});