

function generate_random_color() {
	return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
}