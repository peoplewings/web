define(function() {

	var Config = {
		local: {
			domain: 'localhost',
			server: 'https://peoplewings-be-development.herokuapp.com',
			apiVersion: '/api/v1',
			debug: true,
		},
		test: {
			domain: 'test.peoplewings.com',
			server: 'https://peoplewings-be-test.herokuapp.com',
			apiVersion: '/api/v1',
			debug: false,
		},
		alpha: {
			domain: 'alpha.peoplewings.com',
			server: 'https://peoplewings-be-alpha.herokuapp.com',
			apiVersion: '/api/v1',
			debug: false,
		},
	};

	function getEnv() {
		switch (window.location.hostname) {
			case "localhost":
			case "peoplewings":
			case "0.0.0.0":
			case "127.0.0.1":
				return 'local';

			case "peoplewings-test.herokuapp.com":
			case "test.peoplewings.com":
				return 'test';

			case "peoplewings-alpha.herokuapp.com":
			case "alpha.peoplewings.com":
				return 'alpha';
		}
		throw ('Unknown environment: ' + window.location.hostname);
	}

	function getValue(key) {
		return Config[getEnv()][key];
	}

	return {
		getEnv: getEnv,
		getValue: getValue
	};
});
