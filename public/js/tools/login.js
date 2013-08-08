define(function(require) {

	var api = require('api');
	var chatMng = require('views/chat/chat_manager');

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
	}

	return {
		onSuccess: onSuccess
	};
});
