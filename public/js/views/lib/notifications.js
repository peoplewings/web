// W003 Function 'send' was used before it was defined.
//jshint camelcase:false, maxparams:7, -W003

define(function(require) {

	var $ = require('jquery');
	var api = require('api2');
	var Promise = require('promise');
	var utils = require('utils');
	var alerts = require('views/lib/alerts');
	var UserAccount = require('models/Account');

	var sendNotificationTpl = require('tmpl!templates/lib/send-notification.html');
	var accomodationTpl = require('tmpl!templates/lib/wing.accomodation.html');

	var wingsParams = {
		'none': function(parent) {
			parent.html('');
		},
		'accomodation': function(parent, params) {
			parent.html(accomodationTpl(params));
			parent.parents("form").validate(validation);

			parent.find("input[name=start-date]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});
			parent.find("input[name=end-date]").datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			});
		},
	};

	var validation = {
			rules: {
				publicMessage: {
					maxlength: 1500,
				},
				privateMessage: {
					maxlength: 1500,
				},
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.next("span.help-block"));
			},
	};

	function selectedWingType(container) {
		return container.find('option[value="' + container.find('#wings').val() + '"]').data('type');
	}

	function displayErrors(errors, form) {
		errors.map(function(error){
			form.$('#wing-accomodation-form-errors-date')
				.html('<label class="error">' + error.text + '</label>');
			form.$('#wing-accomodation-form-errors-date').show();
		});
	}

	function modalHelper(targetId, targetName, kind, title, wingsReq, getData) {
		var prom = new Promise();
		var hasTarget = !!targetId;

		Promise.parallel(
			hasTarget || api.get(api.getApiVersion() + '/contacts?type=' + kind),
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

			var modal = utils.showModal({
				header: title,
				accept: 'Send',
				loadingText: 'Sending..',
				content: content,
				callback: send
			});

			modal.on('hidden', function() {
				if (!prom.future.isCompleted())
					prom.resolve(false);
			});
			modal.delegate('#wings', 'change', function() {
				var data = $(this).closest('#wing-data');
				var type = selectedWingType(data);
				wingsParams[type.toLowerCase()](data.find('#wing-parameters'), { kind: kind });
			});

			if (!hasTarget) {
				contacts.forEach(function(contact) {
					contact.fullname = contact.name + ' ' + contact.last_name;
				});

				modal.find('.autocompletePeople').typeahead({
					source: contacts.map(function(c) { return c.fullname; })
				});
			}

			modal.find('form').validate(validation);

			function send() {
				var errors = [];

				if (!modal.find('form').valid())
					return;

				if (new Date($("input[name=end-date]").val()) < new Date($("input[name=start-date]").val()))
					errors.push({css: 'date-error', text: 'Invalid dates'});

				if (errors.length)
					return displayErrors(errors, modal);

				var data = getData(modal);

				if (!hasTarget) {
					var selected = modal.find('.autocompletePeople').val();
					targetId = contacts.filter(function(c) { return c.fullname === selected; })['0'].id;
				}

				$(".accept-modal-btn").button('loading');

				return api.post('/api/v1/notificationslist', {
					"idReceiver": targetId,
					"kind": kind,
					"data": data,
				}).then(function() {
					alerts.success('Message Sent');
					prom.resolve(true);
				}, function(error) {
					alerts.defaultError();
					prom.reject(error);
				}).fin(function() {
					$(".accept-modal-btn").button('reset');
					modal.modal('hide');
				});
			}
		});

		return prom;
	}


	function reqinv(targetId, targetName, kind, title, wingsOwnerId) {
		var request = api.get('/api/v1/wings', { profile:  wingsOwnerId}).prop('data');
		return modalHelper(targetId, targetName, kind, title, request, function(modal) {
			return {
				"privateText": modal.find('#message-content').val(),
				"publicText": modal.find('#public-message-content').val(),
				"makePublic": modal.find('#public-request').is(':checked'),
				"wingType": selectedWingType(modal),
				"wingParameters": {
					"wingId": modal.find('#wings').val(),
					"startDate": +new Date(modal.find('#wing-parameters [name="start-date"]').val())/1000,
					"endDate": +new Date(modal.find('#wing-parameters [name="end-date"]').val())/1000,
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
			modalHelper(targetId, targetName, 'message', 'New message', null, function(modal) {
				return {
					"content": modal.find('#message-content').val(),
				};
			});
		},

		request: function(targetId, targetName) {
			return reqinv(targetId, targetName, 'request', 'New request', targetId);
		},

		invitation: function(targetId, targetName) {
			return reqinv(targetId, targetName, 'invite', 'New invitation', api.getUserId());
		}
	};
});
