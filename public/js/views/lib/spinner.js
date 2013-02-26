define(function(require) {

	var utils = require('utils');
	var spinner = new Spinner(utils.getSpinOpts());
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
	};
});
