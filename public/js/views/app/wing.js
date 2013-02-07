define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var wingTpl = require("tmpl!templates/app/accomodation-form.html");
	var alertTpl = require("tmpl!templates/lib/alert.html");
	var WingModel = require("models/Wing");

	var WingView = Backbone.View.extend({

		events: {
			"submit form#accomodation-form": "submitWing",
			"click #update-wing-btn": "updateWing",
			"click #delete-wing-btn": "deleteWing",
			"click #cancel-wing-btn": "close",
			"click input#inputSharingOnce": function(evt) {
				if (evt.target.checked) $("div#sharing-dates").show()
				else {
					$("div#sharing-dates").hide()
					$("[name=dateStart]").val("")
					$("[name=dateEnd]").val("")
				}
			}
		},

		initialize: function(options) {
			this.papa = options.papa
			this.update = options.update

			this.model = new WingModel({
					id: options.id
			})

			this.model.on("change", this.render.bind(this, false))
			this.model.fetch()
		},

		render: function(update) {
			if (update) this.update = update;

			$(this.el).html(wingTpl({ update: this.update }));
			this.$el.appendTo("#my-wings");

			this.initWing();

			if (this.model.get("id") !== undefined)
				this.unserialize();

		},

		unserialize: function(){
			if (this.model.get("city") === undefined) return;

			this.papa.$("select#wings-list option[value='/api/v1/profiles/" + api.getUserId() + "/accomodations/" + this.model.get("id") + "']")
			.attr("selected", true);

			this.$("#inputName").val(this.model.get("name"));
			this.$("#wingStatus").val(this.model.get("status"));
			this.$("#inputPostalCode").val(this.model.get("postalCode"));
			this.$("#inputNumber").val(this.model.get("number"));
			this.$("#inputAddress").val(this.model.get("address"));
			this.$("#inputCity").val(this.model.get("city").name + ", " + this.model.get("city").country);

			if (this.model.get("additionalInformation"))
				this.$("input#inputAdditionalInfo").val(this.model.get("additionalInformation"));

			if (this.model.get("about"))
				this.$("textarea#inputAbout").val(this.model.get("about"));

			if (this.model.get("sharingOnce") === true)
				this.$("input[name=sharingOnce]").attr("checked", true);
				this.$("input[name=dateStart]").val(this.model.get("dateStart"));
				this.$("input[name=dateEnd]").val(this.model.get("dateEnd"));
				this.$("div#sharing-dates").show();

			if (this.model.get("bestDays"))
				this.$("select#inputBestDays option[value=" + this.model.get("bestDays") + "]").attr("selected", true);

			if (this.model.get("capacity"))
				this.$("select[name=capacity] option[value=" + this.model.get("capacity") + "]").attr("selected", true);

			if (this.model.get("whereSleepingType"))
				this.$("select#whereSleepingType option[value=" + this.model.get("whereSleepingType") + "]").attr("selected", true);

			if (this.model.get("smoking"))
				this.$("select#smoking option[value=" + this.model.get("smoking") + "]").attr("selected", true);

			if (this.model.get("preferredMale") === true)
				this.$("input[name=preferredMale]").attr("checked", true);

			if (this.model.get("preferredFemale") === true)
				this.$("input[name=preferredFemale]").attr("checked", true);

			if (this.model.get("wheelchair") === true)
				this.$("input[name=wheelchair]").attr("checked", true);

			if (this.model.get("iHavePet") === true)
				this.$("input[name=iHavePet]").attr("checked", true);

			if (this.model.get("petsAllowed") === true)
				this.$("input[name=petsAllowed]").attr("checked", true);

			if (this.model.get("blankets") === true)
				this.$("input[name=blankets]").attr("checked", true);

			if (this.model.get("liveCenter") === true)
				this.$("input[name=liveCenter]").attr("checked", true);

			if (this.model.get("tram") === true)
				this.$("input[name=tram]").attr("checked", true);

			if (this.model.get("train") === true)
				this.$("input[name=train]").attr("checked", true);

			if (this.model.get("bus") === true)
				this.$("input[name=bus]").attr("checked", true);

			if (this.model.get("underground") === true)
				this.$("input[name=underground]").attr("checked", true);

			if (this.model.get("others") === true)
				this.$("input[name=others]").attr("checked", true);
		},

		close: function() {
			this.remove();
			this.unbind();
			router.navigate("/#/wings");
		},

		initWing: function() {
			var self = this
			this.$("input[name=dateStart]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
			this.$("input[name=dateEnd]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")

			var autoCity = new google.maps.places.Autocomplete(document.getElementById("inputCity"), {
				types: ['(cities)']
			});
			google.maps.event.addListener(autoCity, 'place_changed', self.setAutocomplete(autoCity, "inputCity"));
			self.$("#inputCity").keypress(function(event) {
				if (event.which == 13) event.preventDefault()
			})

			this.$('#accomodation-form').validate()
		},

		setAutocomplete: function(auto, field) {
			var sc = this
			return function() {
				var place = auto.getPlace()
				if (place.geometry) {
					var cc = utils.getCityAndCountry(place.address_components)
					cc.lat = place.geometry.location.lat() + ""
					cc.lon = place.geometry.location.lng() + ""
					cc.name = cc.city
					delete cc.city
					sc.cityObject = cc
				}
			  }
			return data
		},

		submitWing: function(evt) {
			evt.preventDefault()

			var self = this
			var alertClass = ""
			var data = utils.serializeForm(evt.target.id)

			data.city = this.cityObject
			if ((data.dateStart === "" && data.dateEnd === "") && data.sharingOnce == undefined) {
				delete data.dateStart
				delete data.dateEnd
			}

			api.post(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/list/", data)
			.then(this.handleResponse.bind(this));
		},

		updateWing: function(evt) {
			evt.preventDefault()

			var self = this
			var alertClass = ""
			var data = utils.serializeForm("accomodation-form")

			data.city = this.cityObject
			if ((data.dateStart === "" && data.dateEnd === "") && data.sharingOnce == undefined) {
				delete data.dateStart
				delete data.dateEnd
			}
			api.put(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + this.model.get("id"), data)
			.then(this.handleResponse.bind(this));
		},

		deleteWing: function(evt) {
			var scope = this
			var id = this.model.get("id")
			var uri = api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + id
			if (confirm("Are you sure you want to delete this wing?")) {
				api.delete(uri)
				.then(this.handleResponse.bind(this));
			}
		},

		handleResponse: function(response){

			var alertClass = (!!response.status) ? 'alert-success' : 'alert-error';

			$(alertTpl({ extraClass: alertClass, heading: response.msg }))
			.prependTo('#main')
			.delay(800)
			.slideUp(300);

			if (response.status === true)
				router.navigate("/#/wings");
		}

	});

	return WingView;
});
