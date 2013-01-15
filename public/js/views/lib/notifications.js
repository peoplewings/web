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
		var hasTarget = !!targetId;

		Promise.normalize(
			hasTarget ||
			api.get('/ajax/search/notification_addressee?type=' + kind)
		).then(function(contacts) {
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

			if (!hasTarget) {
				contacts.forEach(function(contact) {
					contact.fullname = contact.name + ' ' + contact.last_name;
				});

				modal.find('.autocompletePeople').typeahead({
					source: contacts.map(function(c) { return c.fullname })
				});
			}

			function send() {
				var data = dataReturner(modal);
				if (!data)
					return;

				if (!hasTarget) {
					var selected = modal.find('.autocompletePeople').val();
					targetId = contacts.filter(function(c) { return c.fullname === selected })['0'].id
				}

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
		});

		return prom.future;
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
				debugger;
				var valid = modal.find('wing-accomodation-params').validate({
					rules: {
						'start-date': 'required',
						'end-date': 'required',
						'via': 'required'
					},
					messages: {
						'start-date': 'Insert a start date',
						'end-date': 'Instert a end date',
						'via': 'Select via'
					}
				});

				// TODO: ask sergio
				if (!valid)
					return null;

				return {
					"content": modal.find('#message-content').val()
				};
			});
		}
	};
});
