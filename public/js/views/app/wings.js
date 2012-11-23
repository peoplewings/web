define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/wings.html',
  'text!templates/lib/alert.html',
  'models/Profile',
], function($, Backbone, api, utils, wingsTpl, alertTpl, UserProfile){
	
  var spinner = new Spinner(utils.getSpinOpts());
	
  var wingsView = Backbone.View.extend({
	el: "#main",
	wings: [],
	events: {
		"click #add-wing-btn": "createWing",
		"change #generalStatus": "changeStatus",
		"change #wings-list": "changeWing",
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
			sc.wings = response.data
			sc.render()
		})
	},
	addWingToList: function(wing){
		this.wings.push(wing)
		this.render()
	},
	createWing: function(){
		var scope = this
		require(["views/app/wing"], function(wingView){
			scope.wingView = new wingView({papa: scope})
			scope.wingView.render({target: "#my-wings", update: false })
			/*setTimeout(function(){ 
				alert("Close!")
				scope.wingView.close() 
			}, 2000)
			setTimeout(function(){ 
				alert("Render")
				scope.wingView.render({target: "#my-wings", update: false}) 
			}, 5000)
			setTimeout(function(){ 
				alert("Close2!")
				scope.wingView.close() 
			}, 7000)*/
		})
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
		var scope = this
		if (e.target.value){
			console.log(e.target.value)
			var id = e.target.value.split("accomodations/", 2)[1]
			require(["views/app/wing"], function(wingView){
				scope.wingView = new wingView({papa: scope})
				scope.wingView.render({target: "#my-wings", update: true, id: id })
			/*setTimeout(function(){ 
				alert("Close!")
				scope.wingView.close() 
			}, 2000)
			setTimeout(function(){ 
				alert("Render")
				scope.wingView.render({target: "#my-wings", update: false}) 
			}, 5000)
			setTimeout(function(){ 
				alert("Close2!")
				scope.wingView.close() 
			}, 7000)*/
			})
		} 
	}
  });

  return new wingsView;
});