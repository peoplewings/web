define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var Promise = require('promise');
	var wingsTpl = require("tmpl!templates/app/wings.html");
	var alertTpl = require("tmpl!templates/lib/alert.html");
	var wingView = require("views/app/wing");
	var ProfileModel = require("models/Profile");
	var WingModel = require("models/Wing");

	var spinner = new Spinner(utils.getSpinOpts());

	var wingsView = Backbone.View.extend({

		el: "#main",

		events: {
			"change [name=generalStatus]": "changeStatus",
			"click #add-wing-btn": function(evt){
				this.openWing({ update: false})
			},
			"change #wings-list": function(evt){
				var id = evt.target.value.split("accomodations/", 2)[1]
				console.log("Change to... ", id)
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
			var self = this
			spinner.spin(document.getElementById('main'));
			api.put(api.getApiVersion() + "/profiles/" + api.getUserId(), {
				pwState: e.target.value
			})
			.prop('msg')
			.then(function(msg) {
				spinner.stop();
				return msg;
			})
			.fin(function(msg) {
				self.$el.prepend(alertTpl({
					extraClass: 'alert-success',
					heading: msg
				}));
			})
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
