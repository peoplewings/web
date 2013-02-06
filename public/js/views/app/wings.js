define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api');
	var utils = require('utils');
	var wingsTpl = require('text!templates/app/wings.html');
	var alertTpl = require('text!templates/lib/alert.html');
	var UserProfile = require('models/Profile');
	var WingModel = require('models/Wing');
	var wingView = require('views/app/wing');

	var spinner = new Spinner(utils.getSpinOpts());

	var wingsView = Backbone.View.extend({
		el: "#main",
		wings: [],
		events: {
			"click #add-wing-btn": "createWing",
			"change #generalStatus": "changeStatus",
			"change #wings-list": "updateWing",
		},
		initialize: function(){
			this.model = new UserProfile({id: api.getUserId()})
			this.bindings = { pwState: "[name=generalStatus]" }
			this._modelBinder = new Backbone.ModelBinder();
			//When no user model has been retrieved first
			if (!this.model.get("pwState")) this.model.fetch()
			this.getUserWings()
		},
		render: function(url){
		  var tpl = _.template(wingsTpl, {wings: this.wings});
	      $(this.el).html(tpl);
		  this._modelBinder.bind(this.model, this.el, this.bindings)
	    },
		getUserWings: function(){
			var sc = this
			api.get(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/list", {}, function(response){
				$.each(response.data, function(index, wing){
					sc.wings.push({name: wing.name, uri: wing.uri})
				})
				sc.render()
			})
		},
		addWingToList: function(wing){
			this.wings.push(wing)
			this.render()
		},
		updateWingToList: function(item){
			//Should only be invoked if Wing name is dirty
			var updated = _.find(this.wings, function(wing){ return wing.uri == item.uri })
			updated.name = item.name
			this.render()
		},
		deleteWingFromList: function(uri){
			this.wings = _.reject(this.wings, function(wing){ return wing.uri == uri })
			this.render()

		},
		createWing: function(){
			//Refactor with changeWing!!
			var scope = this
			if (!this.wingView){
				scope.wingView = new wingView({papa: scope})
				scope.wingView.render({target: "#my-wings", update: false })
			}else {
				this.wingView.close()
				scope.wingView = new wingView({papa: scope})
				scope.wingView.render({target: "#my-wings", update: false })
			}
		},
		changeStatus: function(e){
			spinner.spin(document.getElementById('main'));
			api.put(api.getApiVersion() + "/profiles/" + api.getUserId(), {pwState: e.target.value}, function(response){
				spinner.stop()
				var tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
				$('#main').prepend(tpl)
			})
		},
		updateWing: function(e){
			console.log(this.wings)
			//Refactor with createWing
			var scope = this
			//console.log(e.target.value)
			if (e.target.value){
				var id = e.target.value.split("accomodations/", 2)[1]
				if (!this.wingView){
					scope.wingView = new wingView({papa: scope})
					scope.wingView.render({target: "#my-wings", update: true, id: id })
				} else {
					this.wingView.close()
					scope.wingView = new wingView({papa: scope})
					scope.wingView.render({target: "#my-wings", update: true, id: id })

				}
			}
		}
	});

	return new wingsView;
});
