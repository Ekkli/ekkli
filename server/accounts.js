Accounts.onCreateUser(function (options, user) {

    console.log(JSON.stringify(options));

	user.badges = [];
	user.achievements = {
		created_map: false,
		created_action: false,
		edited_story_title: false,
		created_goal: false,
		advanced_status: false,
		created_link: false,
		invited_collaborators: false,
		maps_created: 0,
		actions_created: 0,
		actions_delivered: 0,
		goals_created: 0,
		goals_delivered: 0
	};

    user.profile = options.profile || {};
    user.createdAt = new Date();

    if (options.email)
        user.profile.email = options.email;
        user.profile.name = options.username;


    if (user.services.facebook)
    {
//        get profile data from Facebook
        result = Meteor.http.get("https://graph.facebook.com/me",{
            params:{
                access_token: user.services.facebook.accessToken
            }
        });
//            if successfully obtained facebook profile, save it off
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


    if (user.services.google){
        var accessToken = user.services.google.accessToken,
            result,
            profile;

        result = Meteor.http.get("https://www.googleapis.com/oauth2/v3/userinfo?alt=json", {
            params: {
                access_token: accessToken
            }
        });

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

    if (user.services.github){
        var accessToken = user.services.github.accessToken,
            result,
            profile;

        result = Meteor.http.get("https://api.github.com/user", {
            params: {
                access_token: accessToken
            }
        });

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
        if(user.profile.name == null)
            user.profile.name = profile.login;

        user.profile.picture = profile.avatar_url;
    }
    if (user.services.twitter){
        var accessToken = user.services.twitter.accessToken,
            result,
            profile;

        result = Meteor.http.get("https://api.twitter.com/1.1/account/verify_credentials.json", {
            params: {
                access_token: accessToken
            }
        });

        console.log('twitter:'+result.data);

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