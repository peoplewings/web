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
		production: {
			domain: 'peoplewings.com',
			server: 'https://peoplewings-be-alpha.herokuapp.com',
			apiVersion: '/api/v1',
			debug: false,
		},
	};

	function getEnv() {
		if (document.location.hostname.indexOf('192.168.1.') === 0)
			return 'local';

		switch (document.location.hostname) {
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

			case "www.peoplewings.com":
			case "peoplewings.com":
				return 'production';
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
