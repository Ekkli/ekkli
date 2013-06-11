// add this function to meteor for call on clinet side
Meteor.methods({
    'sendInvitation': function (toId, msg) {
        if (Meteor.isServer)
            sendInvitation(this.userId, toId, msg);
    }
});