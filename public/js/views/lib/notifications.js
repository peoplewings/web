define(function(require) {

	var api = require('api2');
	var Promise = require('promise');
	var UserAccount = require('models/Account');
	var modalTpl = require('tmpl!templates/lib/modal2.html');
	var sendNotificationTpl = require('tmpl!templates/lib/send-notification.html');
	var accomodationTpl = require('tmpl!templates/lib/wing.accomodation.html');

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

	function show(targetId, targetName, kind, title, button, extra, dataReturner) {
		var prom = new Promise();
		var avatar = new UserAccount({ id: api.getUserId() }).get('avatar');

		var content = sendNotificationTpl(_.extend({
			avatar: avatar,
			message: kind === 'message',
			invitation: kind === 'invitation',
			request: kind === 'request',
			to: {
				id: targetId,
				fullname: targetName
			}
		}, extra));

		var modal = showModal(title, button, content, send);

		modal.on('hidden', function() {
			if (!prom.future.isCompleted())
				prom.resolve(false);
		});

		function send() {
			var data = dataReturner(modal);
			if (!data)
				return;

			api.post('/api/v1/notificationslist', {
				"idReceiver": targetId,
				"kind": kind,
				"data": data
			}).then(function() {
				var alert = $('<div class="alert">Message sent</div>')
				$(document.body).append(alert);
				alert.alert();

				setTimeout(function() {
					alert.alert('close');
				}, 3000);

				prom.resolve(true);
				modal.modal('hide');
			});
		}

		return prom;
	}

	return {

		message: function(targetId, targetName) {
			return show(targetId, targetName, 'message', 'New message', 'Send', null, function(modal) {
				return {
					"content": modal.find('#message-content').val()
				};
			});
		},

		request: function(targetId, targetName) {
			return show(targetId, targetName, 'request', 'New request', 'Send Request', null, function(modal) {
				return {
					"content": modal.find('#message-content').val()
				};
			});
		},

		invitation: function(targetId, targetName) {
			return show(targetId, targetName, 'invitation', 'New invitation', 'Send Invitation', {
				wingParams: accomodationTpl({ invite: true })
			}, function(modal) {
				return {
					"content": modal.find('#message-content').val()
				};
			});
		}
	};
});
