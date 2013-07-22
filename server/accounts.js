Accounts.onCreateUser(function (options, user) {

    console.log(JSON.stringify(options));

    user.profile = options.profile || {};
    user.createdAt = new Date();

    if (options.email)
        user.profile.email = options.email;


    if (user.services.facebook)
    {
//        get profile data from Facebook
        result = Meteor.http.get("https://graph.facebook.com/me",{
            params:{
                access_token: user.services.facebook.accessToken
            }
        });
//            if successfully obtained facebook profile, save it off
        if (!result.error && result.data){
            user.profile.facebook = result.data;
        }
    }


    if (user.services.google){
        var accessToken = user.services.google.accessToken,
            result,
            profile;

        result = Meteor.http.get("https://www.googleapis.com/oauth2/v3/userinfo?alt=json", {
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
            "picture",
            "url",
            "company",
            "blog",
            "location",
            "email");

        user.profile = profile;

    }

    return user;


});