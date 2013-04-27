define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var alerts = require('views/lib/alerts');
	var wingFormTpl = require("tmpl!templates/app/profile/form.wings.html");
	var wingModalTpl = require("tmpl!templates/lib/modal.form.wings.html");
	var wingViewTpl = require("tmpl!templates/app/profile/view.wing.html");

	var WingsView = Backbone.View.extend({

		el: "#main",

		newCityObject: {},

		wingDefaultData: {
			about: "",
			additionalInformation: "",
			tram: false,
			bus: false,
			metro: false,
			train: false,
			others: false,
			liveCenter: false,
			petsAllowed: false,
			wheelchair: false,
			sharingOnce: false,
			iHavePet: false,
			blankets: false,
		},

		events: {
			//"change [name=generalStatus]": "changeStatus",
			"click button#add-wing-btn": function(e){
				e.preventDefault();
				this.wingModal = utils.showModal({
					header: "Add Wing",
					accept: "Save",
					loadingText: 'Saving...',
					content: wingModalTpl,
					send: this.submitWing,
					form: "accomodation-form",
					thin: true,
				});
				this.initWing();
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
			"click a.edit-wing-btn": "editWing",
			"click a.delete-wing-btn": "deleteWing",
			"click button.cancel-wing-btn": "cancelEdition",
			"submit form#accomodation-form": "createWing",
			"submit form[id^=accomodation-form-]": "submitWing",
		},

		initialize: function(parent) {
			this.parentCtrl = parent;
		},

		/*changeStatus: function(e) {
			api.put(api.getApiVersion() + "/profiles/" + api.getUserId(), {
				pwState: e.target.value
			})
			.then(function() {
				alerts.success('Wings general status updated');
			}, function() {
				alerts.defaultError();
			});
		},*/

		submitWing: function(evt){
			evt.preventDefault();
			var wingId = +$(evt.target).attr("data-rel");
			var data = this.parseForm(evt.target.id, this.parentCtrl.model.findWingById(wingId).city);
			$(evt.target).find("button.save-wing-btn").button('loading');

			var self = this;
			api.put(this.parentCtrl.model.urlWings() + "/" + wingId, data)
			.then(function(){
				self.parentCtrl.model.fetchWing({
					wingId: wingId,
					success: self.refreshWing.bind(self, wingId, wingViewTpl)
				});
				alerts.success('Wing saved');
			})
			.fin(function(){
				$(evt.target).find("button.save-wing-btn").button('reset');
			});
		},

		createWing: function(evt){
			evt.preventDefault();
			var data = this.parseForm(evt.target.id, this.newCityObject.city);
			this.newCityObject = null;

			$(evt.target).find("button.save-wing-btn").button('loading');
			var self = this;
			api.post(this.parentCtrl.model.urlWings(), data)
			.then(function(){
				self.parentCtrl.model.fetchWings({
					success: self.parentCtrl.refreshWings.bind(self.parentCtrl, true)
				});
				self.wingModal.modal('hide');
				alerts.success('Wing saved');
			})
			.fin(function(){
				$(evt.target).find("button.save-wing-btn").button('reset');
				self.el = '#main';
			});
		},

		parseForm: function(formId, city){
			var data = this.wingDefaultData;
			data = _.extend(data, utils.serializeForm(formId));
			_.each(data, function(value, attr){
				if (value === "on")
					data[attr] = true;
			});
			if (!data.sharingOnce)
				data = _.omit(data, ["dateStart", "dateEnd"]);

			data.city = city;

			return data;
		},

		editWing: function(evt){
			evt.preventDefault();
			var wingId = +evt.target.attributes['wing-id'].value;
			this.el = '#wing-box-' + wingId;

			this.initWing(this.refreshWing(wingId, wingFormTpl));
		},

		cancelEdition: function(evt){
			evt.preventDefault();

			var wingId = +evt.target.attributes['wing-id'].value;
			this.$("#accomodation-form-" + wingId)[0].reset();

			this.refreshWing(wingId, wingViewTpl);

			this.el = '#main';
		},

		refreshWing: function(wingId, tpl){
			var wing = this.parentCtrl.model.findWingById(wingId);
			$(this.el).html(tpl(wing, {myProfile: true}));

			return wing;
		},

		initWing: function(wing){
			var dS = "";
			var dE = "";

			if (wing && wing.sharingOnce){
				this.$("div#sharing-dates").show();
				dS = wing.dateStart;
				dE = wing.dateEnd;
			}

			this.$("div#sharing-dates").hide();

			this.$('#accomodation-form').validate();
			this.$("input[name=dateStart]")
			.datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			})
			.val(dS);

			this.$("input[name=dateEnd]")
			.datepicker({
				minDate: new Date(),
				dateFormat: "yy-mm-dd",
			})
			.val(dE);

			var autoCity = new google.maps.places.Autocomplete(document.getElementById("inputCity"), {
				types: ['(cities)']
			});

			var wingObj = wing || this.newCityObject;
			google.maps.event.addListener(autoCity, 'place_changed', utils.setAutocomplete.bind(this, autoCity, wingObj));

			this.$("#inputCity").keypress(function(event){
				if (event.which === 13) event.preventDefault();
			});

			this.$('#accomodation-form').validate();
		},

		deleteWing: function(evt){
			evt.preventDefault();
			var wingId = evt.target.attributes['wing-id'].value;

			var self = this;
			if (confirm("Are you sure you want to delete this wing?")) {
				api.delete(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + wingId)
				.then(function() {
					self.parentCtrl.model.fetch({success: function(){
						self.parentCtrl.model.fetchWings({ success: self.parentCtrl.refreshWings.bind(self.parentCtrl, true)});
						alerts.success('Wing deleted');
					}});
				}, function() {
					alerts.defaultError();
				});
			}
		}
	});

return WingsView;
});
