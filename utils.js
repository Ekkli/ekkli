
line_colors = ["#cbbe67", "#3dcfd5", "#17deee", "#60c4b5", "#cced23", "#bce095", "#b5f825", "#83b59f", "#a0cdbf",  "#ff87e1", "#4ae389", "#3ebe60",  "#e0940a", "#a6b19f", "#e882dd", "#f38bad",  "#3cf210", "#aaf9b4",  "#d5dc5b", "#6badda", "#8da829", "#c8d280",  "#b4a829",  "#9bf489", "#34d745", "#e9f906", "#c99fad",   "#aee7fb",  "#d7aff2",  "#1dea61",  "#33b7c6", "#b48ff2", "#7deaf0", "#22f204",  "#5cc3c6",  "#fa57d0", "#e1dd60",  "#b09cc5", "#75ded9", "#b19970",  "#ff84e2", "#fca430", "#e18c6c", "#2fe4a1", "#edd68d",  "#f5a6ca", "#cad9b4", "#88b20f"];
generate_random_color=function() {
//	var color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
//	while (color.length < 7) color += "0";
//  return color;
	var i = Math.random() * line_colors.length; 
	return line_colors[Math.floor(i)];
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