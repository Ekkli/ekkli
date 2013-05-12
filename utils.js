

generate_random_color=function() {
	return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
}