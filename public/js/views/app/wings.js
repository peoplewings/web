define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/wings.html',
  'text!templates/lib/alert.html',
  'models/Profile',
  'models/Wing',
], function($, Backbone, api, utils, wingsTpl, alertTpl, UserProfile, WingModel){
	
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
		this.model = new UserProfile({id: api.getProfileId()})
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
		api.get(api.getApiVersion() + "/profiles/" + api.getProfileId() + "/accomodations", {}, function(response){
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
		var updated = _.find(this.wings, function(wing){ return wing.uri == item.uri })
		updated.name = item.name
		this.render()
	},
	deleteWingFromList: function(id){
		//Should be an id, but I need id's from server before!!??
		this.wings = _.reject(this.wings, function(wing){ return wing.uri == id })
		this.render()
		
	},
	createWing: function(){
		//Refactor with changeWing!!
		var scope = this
		if (!this.wingView){
			require(["views/app/wing"], function(wingView){
				scope.wingView = new wingView({papa: scope})
				scope.wingView.render({target: "#my-wings", update: false })
			})
		}else {
				this.wingView.close()
				require(["views/app/wing"], function(wingView){
					scope.wingView = new wingView({papa: scope})
					scope.wingView.render({target: "#my-wings", update: false })
				})
				
		}
	},
	changeStatus: function(e){
		spinner.spin(document.getElementById('main'));
		api.put(api.getApiVersion() + "/profiles/me", {pwState: e.target.value}, function(response){
			spinner.stop()
			var tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
			$('#main').prepend(tpl)
		})
	},
	updateWing: function(e){
		//Refactor with createWing
		var scope = this
		console.log(e.target.value)
		if (e.target.value){
			var id = e.target.value.split("accomodations/", 2)[1]
			if (!this.wingView){
				require(["views/app/wing"], function(wingView){
					scope.wingView = new wingView({papa: scope})
					scope.wingView.render({target: "#my-wings", update: true, id: id })
				})
			} else {
				this.wingView.close()
				require(["views/app/wing"], function(wingView){
					scope.wingView = new wingView({papa: scope})
					scope.wingView.render({target: "#my-wings", update: true, id: id })
				})
				
			} 
		} 
	}
  });

  return new wingsView;
});