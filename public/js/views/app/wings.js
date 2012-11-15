define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/wings.html',
  'text!templates/app/accomodation-form.html',
  'text!templates/lib/alert.html',
  'models/Profile',
  'views/app/wing',
], function($, Backbone, api, utils, wingsTpl, wingFormTpl, alertTpl, UserProfile, wingView){
	
  var spinner = new Spinner(utils.getSpinOpts());
	
  var wingsView = Backbone.View.extend({
	el: "#main",
	wings: [],
	events: {
		"click #add-wing-btn": "addWing",
		"change #generalStatus": "changeStatus"
	},
	initialize: function(){
		this.model = new UserProfile({id:"me"})
		this.model.bindings = {
			pwStatus: "[name=generalStatus]"
		}
		this._modelBinder = new Backbone.ModelBinder();
		this.getUserWings()
		
	},
	render: function(url){
	  var tpl = _.template(wingsTpl, {wings: this.wings});
      $(this.el).html(tpl);
    },
	getUserWings: function(){
		var sc = this
		api.get("/profiles/me/accomodations", {}, function(response){
			console.log(response)
			sc.wings = response.data
		})
	},
	addWing: function(evt){
		wingView.render()
		return false
	},
	changeStatus: function(e){
		spinner.spin(document.getElementById('main'));
		api.put("/profiles/me", {pwState: e.target.value}, function(response){
			spinner.stop()
			var tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
			$('#main').prepend(tpl)
		})
	}
  });

  return new wingsView;
});