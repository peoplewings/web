define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var alerts = require('views/lib/alerts');
	var wingFormTpl = require("tmpl!templates/app/profile.form.wings.html");
	var wingModalTpl = require("tmpl!templates/lib/modal.form.wings.html");
	var wingViewTpl = require("tmpl!templates/app/profile.view.wing.html");

	var WingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"change [name=generalStatus]": "changeStatus",
			"click button#add-wing-btn": function(e){
				e.preventDefault();
				utils.showModal({
					header: "Add Wing",
					accept: "Save",
					content: wingModalTpl,
					send: this.submitWing,
				});
			},
			"click input#inputSharingOnce": function(evt) {
				if (evt.target.checked)
					this.$("div#sharing-dates").show();
				else {
					this.$("div#sharing-dates").hide();
					this.$("[name=dateStart]").val("");
					this.$("[name=dateEnd]").val("");
				}
			},
			"click button[id^=edit-wing-]": "editWing",
			"click button.cancel-wing-btn": "cancelEdition",
			"submit form[id^=accomodation-form-]": "submitWing",
			"click button.delete-wing-btn": "deleteWing",
			
		},

		initialize: function(parent) {
			this.parentCtrl = parent;
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

		submitWing: function(evt){
			debugger;
			evt.preventDefault();
			
			var wingId = +$(evt.target).attr("data-rel");
			var data = utils.serializeForm(evt.target.id);
			_.each(data, function(value, attr){ 
				if (value === "on")
					data[attr] = true; 
			});
			
			data.city = this.parentCtrl.model.findWingById(wingId).city;

			var self = this;
			api.put(this.parentCtrl.model.urlWings() + "/" + wingId, data)
				.then(function(){
					alerts.success('Wing saved');
					self.parentCtrl.model.fetchWing({wingId: wingId});
				})
				.fin(function(){
					$(evt.target).find("button.save-wing-btn").button('reset');
					self.refreshWing(wingId, wingViewTpl);
				});
		},

		editWing: function(evt){
			evt.preventDefault();
			var nodeId = $(evt.target).parent().attr("id") || evt.target.id;
			var wingId = +nodeId.split("wing-")[1];
			this.el = nodeId;
			//debugger;

			this.refreshWing(wingId, wingFormTpl);
			this.initWing(wingId);
		},

		cancelEdition: function(evt){
			evt.preventDefault();

			var wingId = +evt.target.id.split("wing-")[1];
			this.$("#accomodation-form-" + wingId)[0].reset();

			this.refreshWing(wingId, wingViewTpl);
		},

		refreshWing: function(wingId, tpl){
			var wing = this.parentCtrl.model.findWingById(wingId);
			var box = this.$("#wing-box-" + wingId);
			console.log(wing);
			$(box).html(tpl(wing, {myProfile: true}));
		},

		initWing: function(wingId){
			var wing = this.parentCtrl.model.findWingById(wingId);
			
			if (!wing.sharingOnce)
				this.$("div#sharing-dates").hide();

			this.$("input[name=dateStart]")
				.datepicker()
				.datepicker("option", "dateFormat", "yy-mm-dd")
				.val(wing.dateStart);
			this.$("input[name=dateEnd]")
				.datepicker()
				.datepicker("option", "dateFormat", "yy-mm-dd")
				.val(wing.dateEnd);

			var autoCity = new google.maps.places.Autocomplete(document.getElementById("inputCity"), {
				types: ['(cities)']
			});
			google.maps.event.addListener(autoCity, 'place_changed', utils.setAutocomplete.bind(this, autoCity, wing));
			
			self.$("#inputCity").keypress(function(event) {
				if (event.which === 13) event.preventDefault();
			});

			this.$('#accomodation-form').validate();
			/*
			TODO: 
				Initialize places typeahead
				check all fields in tpl
				use exact same tpl in modal than in edition,
				get rid of view.wings.html o view.wing.html
			*/

		},

		deleteWing: function(evt){
			var wingId = $(evt.target).attr("wing-id");
			console.log("DELETE WING with ID:", wingId);


			var self = this;
			if (confirm("Are you sure you want to delete this wing?")) {
				api.delete(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + wingId)
					.then(function() {
						self.parentCtrl.model.fetch({success: function(){
							debugger;
							self.parentCtrl.refreshWings.bind(self.parentCtrl, true);
							alerts.success('Wing deleted');
						}});
					}, function() {
						alerts.defaultError();
					});
			}
			debugger;
		}
	});

	return WingsView;
});
