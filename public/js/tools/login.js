define(function(require) {

	var api = require('api');
	var chatMng = require('views/chat/chat_manager');
	var Header = require('views/app/header');
	var geolocation = require('tools/geolocation');

	function onSuccess(data, remember) {
		api.saveAuthToken({
			auth: data.xAuthToken,
			uid: data.idAccount,
			remember: remember
		});

		router.firstExecution = data.tutorial;
		router.header = new Header;
		router.navigate('#/search');
		chatMng.cleanOldChats()
			.then(chatMng.startup.bind(chatMng));

		geolocation.getCurrentCity().then(function(res){
			if (res){
				var params = {
					city: res.city.split(', ')[0],
					country: res.city.split(', ')[1],
					lat: res.lat,
					lon: res.lng
				};
				api.put('/api/v1/geolocation', params);
			}
		});
	}

	return {
		onSuccess: onSuccess
	};
});
