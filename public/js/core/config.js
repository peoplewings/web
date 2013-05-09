define(function() {

	var Config = {
		Local: {
			domain: 'localhost',
			server: 'http://peoplewings-be-development.herokuapp.com',
			apiVersion: '/api/v1',
		},
		Test: {
			domain: 'test.peoplewings.com',
			server: 'http://peoplewings-be-test.herokuapp.com',
			apiVersion: '/api/v1',
		},
		Alpha: {
			domain: 'alpha.peoplewings.com',
			server: 'http://peoplewings-be-alpha.herokuapp.com',
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
				//case: 'pw-test-bucket',
				case "test.peoplewings.com":
					env = 'Test';
					break;
				case "peoplewings-alpha.heroku.com":
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