define(function() {

	function parseCookies() {
		var cookies = {};
		var list = document.cookie.split(/; ?/);

		list.forEach(function(cookie) {
			var name = cookie.substr(0, cookie.indexOf('='));
			var value = cookie.substr(cookie.indexOf('=') + 1);
			cookies[name] = value;
		});

		return cookies;
	}



	return {
		getAll: parseCookies,

		get: function(name) {
			return parseCookies()[name] || null;
		},

		startWith: function(text) {
			var cookies = parseCookies();
			var found = null;

			Object.keys(cookies).some(function(name) {
				if (name.indexOf(text) !== 0)
					return;

				found = {
					name: name,
					value: cookies[name]
				};

				return true;
			});

			return found;
		}
	};
});
