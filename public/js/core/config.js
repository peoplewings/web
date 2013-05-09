define(function() {

	var Config = {
		Local: {
			domain: 'localhost',
			server: 'https://peoplewings-be-development.herokuapp.com',
			apiVersion: '/api/v1',
		},
		Test: {
			domain: 'test.peoplewings.com',
			server: 'https://peoplewings-be-test.herokuapp.com',
			apiVersion: '/api/v1',
		},
		Alpha: {
			domain: 'alpha.peoplewings.com',
			server: 'https://peoplewings-be-alpha.herokuapp.com',
			apiVersion: '/api/v1',
		},
	};

	return {
		getValue: function(key) {
			var env;
			switch (window.location.hostname) {
				case "localhost":
				case "peoplewings":
				case "0.0.0.0":
				case "127.0.0.1":
					env = 'Local';
					break;
				case "peoplewings-test.herokuapp.com":
				case "test.peoplewings.com":
					env = 'Test';
					break;
				case "peoplewings-alpha.herokuapp.com":
				case "alpha.peoplewings.com":
					env = 'Alpha';
					break;
				default:
					throw ('Unknown environment: ' + window.location.hostname);
			}
			return Config[env][key];
		}
	};
});