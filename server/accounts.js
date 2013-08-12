Accounts.onCreateUser(function (options, user) {

    console.log(JSON.stringify(options));

	user.badges = [];
	user.achievements = {
		created_map: false,
		created_action: false,
		edited_story_title: false,
		created_another_action: false,
		created_result: false,
		advanced_status: false,
		selected_previous_story: false,
		created_fork: false,
		created_link: false,
		invited_collaborators: false,
		maps_created: 0,
		actions_created: 0,
		actions_delivered: 0,
		results_created: 0,
		results_delivered: 0
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