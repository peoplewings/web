define(function(require) {

	var api = require('api2');
	var Promise = require('promise');
	var UserAccount = require('models/Account');
	var modalTpl = require('tmpl!templates/lib/modal2.html');
	var sendMessageTpl = require('tmpl!templates/lib/send-message.html');

	function showModal(header, accept, content, callback) {
		var modal = $(modalTpl({
			header: header,
			accept: accept,
			content: content
		}));
		$("body section:last").append(modal);

		modal.modal('show');
		modal.find('.btn-primary').click(callback);

		modal.on('hidden', function() {
			modal.remove();
		});

		return modal;
	}

	return {

		message: function(targetId, targetName) {
			var prom = new Promise();
			var avatar = new UserAccount({ id: api.getUserId() }).get('avatar');
			var content = sendMessageTpl({
				avatar: avatar,
				to: {
					id: targetId,
					fullname: targetName,
				}
			});

			var modal = showModal('New message', 'Send', content, send);
			modal.on('hidden', function() {
				if (!prom.future.isCompleted())
					prom.reject();
			});

			modal.find('#message-content').focus();

			function send() {
				api.post('/api/v1/notificationslist', {
					"idReceiver": targetId,
					"kind": "message",
					"data": {
						"content": modal.find('#message-content').val()
					}
				}).then(function() {
					var alert = $('<div class="alert">Message sent</div>')
					$(document.body).append(alert);
					alert.alert();

					setTimeout(function() {
						alert.alert('close');
					}, 3000);

					prom.resolve();
					modal.modal('hide');
				});
			}

			return prom.future;
		}
	};
});
