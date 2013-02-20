define(function(require) {

	var spinners = [];
	var timers = {};

	function show(id) {
		spinners.push(id);
		$('#mini-spinner').show();
	}

	function hide(id) {
		clearTimeout(timers[id]);
		spinners = spinners.filter(function(a) {
			return a !== id;
		});

		if (!spinners.length) {
			$('#mini-spinner').hide();
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
