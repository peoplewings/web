define(function() {

	var options = {
		lines: 13, // The number of lines to draw
		length: 3, // The length of each line
		width: 1, // The line thickness
		radius: 7, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};
	var spinner = new Spinner();
	var spinners = [];
	var timers = {};

	function show(id) {
		spinners.push(id);
		spinner.spin($('#mini-spinner').get(0));
	}

	function hide(id) {
		clearTimeout(timers[id]);
		spinners = spinners.filter(function(a) {
			return a !== id;
		});

		if (!spinners.length) {
			spinner.stop();
		}
	}

	function showAfter(id, time) {
		if (!time)
			return show(id);
		timers[id] = setTimeout(show.bind(null, id), time);
	}


	return {
		show: showAfter,
		hide: hide,
		options: options,
	};
});
