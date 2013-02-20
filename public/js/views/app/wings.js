define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var Promise = require('promise');
	var wingsTpl = require("tmpl!templates/app/wings.html");
	var alerts = require('views/lib/alerts');
	var wingView = require("views/app/wing");
	var ProfileModel = require("models/Profile");
	var WingModel = require("models/Wing");

	var spinner = new Spinner(utils.getSpinOpts());
	/*
		spinner.spin(document.getElementById('main'));
		spinner.stop();

		var alertTpl = rekire("tmpl!templates/lib/alert.html");
	*/

	var wingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"change [name=generalStatus]": "changeStatus",
			"click #add-wing-btn": function(evt){
				this.openWing({ update: false})
			},
			"change #wings-list": function(evt){
				var id = evt.target.value.split("accomodations/", 2)[1]
				router.navigate("/#/wings/" + id);
			}
		},

		initialize: function() {
			this.model = new ProfileModel({ id: api.getUserId() });
			this.model.on("change", this.render.bind(this, null));

			this.list = new Backbone.Collection();
			this.list.on("reset", this.render.bind(this, null));

			this.getWingsData();

		},

		render: function(wingId) {
			$(this.el).html(wingsTpl(
				{
					generalStatus: this.model.get("pwState"),
					wings: this.list.toJSON(),
				}
			));

			if (wingId)
				this.openWing({ id: wingId, update: true});
		},

		openWing: function(options){
			this.wingView = new wingView({
					papa: self,
					id: options.id,
					update: options.update,
			})

			this.wingView.render(options.update);
		},

		getWingsData: function() {
			var self = this;

			Promise.parallel(
				api.get(api.getApiVersion() + "/profiles/" + api.getUserId()),
				api.get(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/list")
			).spread(function(profile, wings) {
				self.model.set(profile.data, {silent: true});
				self.list.reset(wings.data);
			});
		},

		changeStatus: function(e) {
			api.put(api.getApiVersion() + "/profiles/" + api.getUserId(), {
				pwState: e.target.value
			})
			.then(function() {
				alerts.success('Wings general status updated');
			}, function(error) {
				alerts.defaultError();
			});
			
		},

		addWingToList: function(wing) {
			this.list.push(wing)
			this.render()
		},

		deleteWingFromList: function(uri) {
			this.list = _.reject(this.list,
			function(wing) {
				return wing.uri == uri
			})
			this.render()
		},
	});

	return wingsView;
});
