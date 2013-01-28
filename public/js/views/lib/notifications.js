define(function(require) {

	var api = require('api2');
	var Promise = require('promise');
	var UserAccount = require('models/Account');
	var modalTpl = require('tmpl!templates/lib/modal2.html');
	var sendNotificationTpl = require('tmpl!templates/lib/send-notification.html');
	var wingsTemplates = {
		'none': function() { return '' },
		'accomodation': require('tmpl!templates/lib/wing.accomodation.html'),
	};

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

	function selectedWingType(container) {
		return container.find('option[value="' + container.find('#wings').val() + '"]').data('type')
	}


	function modalHelper(targetId, targetName, kind, title, button, wingsReq, getData) {
		var prom = new Promise();
		var hasTarget = !!targetId;

		Promise.parallel(
			hasTarget || api.get('/ajax/search/notification_addressee?type=' + kind),
			wingsReq
		).spread(function(contacts, wings) {
			var avatar = new UserAccount({ id: api.getUserId() }).get('avatar');

			var content = sendNotificationTpl({
				avatar: avatar,
				kind: kind,
				to: {
					id: targetId,
					fullname: targetName
				},
				wings: wings ? [{
					idWing: null,
					wingName: 'Select a wing',
					wingType: 'none',
				}].concat(wings.items) : null,
			});

			var modal = showModal(title, button, content, send);

			modal.on('hidden', function() {
				if (!prom.future.isCompleted())
					prom.resolve(false);
			});
			modal.delegate('#wings', 'change', function() {
				var data = $(this).closest('#wing-data');
				var type = selectedWingType(data);
				data.find('#wing-parameters')
					.html(wingsTemplates[type.toLowerCase()]({ kind: kind }));
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
				var data = getData(modal);
				if (!data)
					return;

				if (!hasTarget) {
					var selected = modal.find('.autocompletePeople').val();
					targetId = contacts.filter(function(c) { return c.fullname === selected })['0'].id
				}

				api.post('/api/v1/notificationslist', {
					"idReceiver": targetId,
					"kind": kind,
					"data": data,
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

		return prom;
	}


	function reqinv(targetId, targetName, kind, title, button, wingsOwnerId) {
		var request = api.get('/api/v1/wings?profile=' + wingsOwnerId).prop('data');
		return modalHelper(targetId, targetName, kind, title, button, request, function(modal) {
			return {
				"privateText": modal.find('#message-content').val(),
				"publicText": modal.find('#public-message-content').val(),
				"makePublic": modal.find('#public-request').is(':checked'),
				"wingType": selectedWingType(modal),
				"wingParameters": {
					"wingId": modal.find('#wings').val(),
					"startDate": +new Date(modal.find('#wing-parameters [name="start-date"]').val()),
					"endDate": +new Date(modal.find('#wing-parameters [name="end-date"]').val()),
					"capacity": modal.find('#wing-parameters [name="capacity"]').val(),
					"arrivingVia": modal.find('#wing-parameters [name="via"]').val(),
					"flexibleStart": modal.find('#wing-parameters #flexible-start-date').is(':checked'),
					"flexibleEnd": modal.find('#wing-parameters #flexible-end-date').is(':checked'),
				}
			};
		});
	}


	return {

		message: function(targetId, targetName) {
			modalHelper(targetId, targetName, 'message', 'New message', 'Send', null, function(modal) {
				return {
					"content": modal.find('#message-content').val(),
				};
			});
		},

		request: function(targetId, targetName) {
			return reqinv(targetId, targetName, 'request', 'New request', 'Send request', targetId);
		},

		invitation: function(targetId, targetName) {
			return reqinv(targetId, targetName, 'invite', 'New invitation', 'Send invitation', api.getUserId());
		}
	};
});
