

generate_random_color=function() {
	var color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
	while (color.length < 7) color += "0";
	return color;
}