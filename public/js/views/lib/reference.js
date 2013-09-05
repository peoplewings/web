// W003 Function 'send' was used before it was defined.
//jshint -W003

define(function(require) {

	var $ = require('jquery');
	var api = require('api');
	var Promise = require('promise');
	var utils = require('utils');
	var alerts = require('views/lib/alerts');
	var UserAccount = require('models/Account');

	var sendReferenceTpl = require('tmpl!templates/lib/send-reference.html');

	var validation = {
		rules: {
			message: {
				maxlength: 1000,
			},
		},
		errorPlacement: function(error, element) {
			error.appendTo(element.next('span.help-block'));
		},
	};

	function openModal(targetId, targetName) {
		var prom = new Promise();
		var avatar = new UserAccount({ id: api.getUserId() }).get('avatar');

		var content = sendReferenceTpl({
			avatar: avatar,
			to: {
				id: targetId,
				fullname: targetName,
			}
		});

		var modal = utils.showModal({
			header: 'Send Reference',
			accept: 'Send',
			loadingText: 'Sending...',
			content: content,
			callback: send,
		});

		var faces = modal.find('.faces');

		modal.on('hidden', function() {
			if (!prom.future.isCompleted())
				prom.resolve(false);
		});
		modal.find('input[name=rating]').change(function(){
			if (this.value === '0'){
				faces.css('background-position', '-1034px -162px');
			} else if (this.value === '1'){
				faces.css('background-position', '-1141px -162px');
			} else {
				faces.css('background-position', '-1245px -162px');
			}
		});
		var $form = modal.find('form');
		$form.validate(validation);

		function send() {
			if (!$form.valid())
				return;

			var data = utils.serializeForm($form);
			$('.accept-modal-btn').button('loading');
			data.rating = [ 'good', 'neutral', 'bad' ][data.rating];

			return api.post('/api/v1/references', data)
				.then(function() {
					alerts.success('Reference Sent');
					prom.resolve(true);
				}, function(error) {
					prom.reject(error);
				}).fin(function() {
					$('.accept-modal-btn').button('reset');
					modal.modal('hide');
				});
		}

		return prom.future;
	}

	return {
		openModal: openModal,
	};
});
