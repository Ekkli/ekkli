Template.welcome.events({
    'click button#continue' : function () {
        event.preventDefault();

        window.location.href =(window.location.href.substring(0, document.URL.indexOf("user_id")));
        return false;

    }
});