Accounts.onCreateUser(function (options, user) {
    var accessToken = user.services.google.accessToken,
        result,
        profile;

    result = Meteor.http.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        params: {
            access_token: accessToken
        }
    });

    console.log("result :"+result.data);

    if (result.error)
        throw result.error;

    profile = _.pick(result.data,
        "login",
        "name",
        "avatar_url",
        "url",
        "company",
        "blog",
        "location",
        "email");

    user.profile = profile;

    return user;
});