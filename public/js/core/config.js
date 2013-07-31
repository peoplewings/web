define(function() {

	var Config = {
		local: {
			server: 'http://localhost:5000',
			apiVersion: '/api/v1',
			debug: true,
			firebase: 'https://peoplewings-chat.firebaseIO.com',
		},
		development: {
			server: 'https://peoplewings-be-development.herokuapp.com',
			apiVersion: '/api/v1',
			debug: true,
			firebase: 'https://peoplewings-chat.firebaseIO.com'
		},
		test: {
			server: 'https://peoplewings-be-test.herokuapp.com',
			apiVersion: '/api/v1',
			debug: false,
			firebase: 'https://peoplewings-chat-test.firebaseIO.com',
		},
		production: {
			server: 'https://peoplewings-be-alpha.herokuapp.com',
			apiVersion: '/api/v1',
			debug: false,
			firebase: 'https://peoplewings-chat-production.firebaseIO.com',
		},
	};

	function getEnv() {
		if (document.location.hostname.indexOf('192.168.1.') === 0)
			return 'local';

		switch (document.location.hostname) {
			case "localhost":
			case "0.0.0.0":
			case "127.0.0.1":
				return 'local';

			case "peoplewings":
			case "development":
			case "dev":
				return 'development';

			case "peoplewings-test.herokuapp.com":
			case "test.peoplewings.com":
				return 'test';

			case "peoplewings-alpha.herokuapp.com":
			case "alpha.peoplewings.com":
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
