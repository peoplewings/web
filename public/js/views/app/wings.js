define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/wings.html',
  'text!templates/app/accomodation-form.html',
  'text!templates/lib/alert.html',
  'models/Profile',
], function($, Backbone, api, utils, wingsTpl, wingFormTpl, alertTpl, UserProfile){
	
  var spinner = new Spinner(utils.getSpinOpts());
	
  var wingsView = Backbone.View.extend({
	el: "#main",
	wings: [],
	events: {
		"click #add-wing-btn": "addWing",
		"change #generalStatus": "changeStatus",
		"change #wings-list": "changeWing"
	},
	initialize: function(){
		this.model = new UserProfile({id:"me"})
		this.bindings = {
			pwState: "[name=generalStatus]"
		}
		this._modelBinder = new Backbone.ModelBinder();
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
		api.get(api.getApiVersion() + "/profiles/me/accomodations", {}, function(response){
			console.log(response)
			sc.wings = response.data
			sc.render()
		})
	},
	addWing: function(evt){
		var scope = this
		if (!this.accomodationView){
				require(["views/app/wing"], function(accomodationView){
					scope.accomodationView = accomodationView
					scope.accomodationView.render()
				})
		} else this.accomodationView.render()
		return false
	},
	changeStatus: function(e){
		spinner.spin(document.getElementById('main'));
		api.put(api.getApiVersion() + "/profiles/me", {pwState: e.target.value}, function(response){
			spinner.stop()
			var tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
			$('#main').prepend(tpl)
		})
	},
	changeWing: function(e){
		if (e.target.value){
			console.log(e.target.value)
			api.get(e.target.value, {}, function(){
				console.log(arguments[0])
			})

		} 
	}
  });

  return new wingsView;
});