var contactEmail = function (user) {
    if (user.emails && user.emails.length)
        return user.emails[0].address;
    if (user.services && user.services.facebook && user.services.facebook.email)
        return user.services.facebook.email;
    return null;
};


