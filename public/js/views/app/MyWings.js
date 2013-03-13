define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var alerts = require('views/lib/alerts');
	var wingFormTpl = require("tmpl!templates/app/profile.form.wings.html");

	var WingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"change [name=generalStatus]": "changeStatus",
			"click button[id^=edit-wing-]": "editWing",
		},

		initialize: function(parent) {
			this.parentCtrl = parent;
		},

		editWing: function(evt){
			var wingId = $(evt.target).parent().attr("id") || evt.target.id;
			wingId = +wingId.split("wing-")[1];

			var wing = _.find(this.parentCtrl.model.get("wingsCollection"), function(wing){
				return wing.id === wingId;
			});
			var box = this.$("#wing-box-" + wingId);
			console.log(wing)
			$(box).html(wingFormTpl(wing));
			
		},

		changeStatus: function(e) {
			api.put(api.getApiVersion() + "/profiles/" + api.getUserId(), {
				pwState: e.target.value
			})
			.then(function() {
				alerts.success('Wings general status updated');
			}, function() {
				alerts.defaultError();
			});

		},
	});

	return WingsView;
});
