define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
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
			
			this.model = new ProfileModel({
				id: api.getUserId()
			})
			this.model.on("change", this.render.bind(this, null))

			if (!this.model.get("pwState"))
				this.model.fetch()

			this.wingsList = new Backbone.Collection();
			this.getUserWings()
		},

		render: function(wingId) {
			
			$(this.el).html(wingsTpl(
				{
					wings: this.wingsList.toJSON(),
					generalStatus: this.model.get("pwState")
				}
			));

			if (wingId){
				this.openWing({ id: wingId, update: true});
			}
		},

		openWing: function(options){

			this.wingView = new wingView({
					papa: self,
					id: options.id,
					update: options.update,
			})

			this.wingView.render(options.update);

		},

		getUserWings: function() {
			var self = this
			
			api.get(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/list")
			.prop('data')
			.then(function(data) {
				self.wingsList.reset(data)
			})
			.fin(function(){
				self.render()
			})
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
			this.wingsList.push(wing)
			this.render()
		},

		updateWingToList: function(item) {
			//Should only be invoked if Wing name is dirty
			var updated = _.find(this.wings,
			function(wing) {
				return wing.uri == item.uri
			})
			updated.name = item.name
			this.render()
		},

		deleteWingFromList: function(uri) {
			this.wingsList = _.reject(this.wingsList,
			function(wing) {
				return wing.uri == uri
			})
			this.render()

		},
	});

	return new wingsView;
});