var contactEmail = function (user) {
    if (user.emails && user.emails.length)
        return user.emails[0].address;
    if (user.services && user.services.facebook && user.services.facebook.email)
        return user.services.facebook.email;
    return null;
};

// this function must be in a file inside the server/ directory to be sure that the client cannot read it.
var sendInvitation = function (fromId, toId, msg) {
    var from = Meteor.users.findOne(fromId);
    var to = Meteor.users.findOne(toId);
    var fromEmail = contactEmail(from);
    var toEmail = contactEmail(to);
    Email.send({
        from: fromEmail,
        to: toEmail,
        replyTo: fromEmail || undefined,
        subject: "Meteorize: "+from.username+" sent you this email !",
        text: "Hello "+to.username+",\n\n"+msg+
            "You are invited to participate in the discussion!\n\n"
//            Discussion.absoluteUrl()+"\n";
    });
}

// add this function to meteor for call on clinet side
Meteor.methods({
    'sendInvitation': function (toId, msg) {
        if (Meteor.isServer)
            sendInvitation(this.userId, toId, msg);
    }
});