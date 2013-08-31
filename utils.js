

generate_random_color=function() {
	var color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
	while (color.length < 7) color += "0";
	return color;
}


// input validations
// return error message if invalid, or null if valid

validateUsername = function(username) {
	if (username.length < 3) {
		return "The username must contain at least 3 characters";
	}
  var illegalChars = /\W/;
  if (illegalChars.test(username)) {
	  return "The username can only contain letters, digits &amp; underscore";
  }
  return null;
}


validatePassword = function(password) {
	if (password.length < 6) {
		return "The password must contain at least 6 characters";
	}
  return null;
}

validateEmail = function(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!regex.test(email)) {
	  return "You need to fill a valid email address";
  };
  return null;
}