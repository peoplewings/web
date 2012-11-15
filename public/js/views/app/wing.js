define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/accomodation-form.html',
], function($, Backbone, api, utils, wingTpl){
	
	
  var wingView = Backbone.View.extend({
	el: "#main",
	events: {
		"submit form#accomodation-form": "submitWing"
	},
	initialize: function(){
		$("input[name=startDate]").datepicker();
		$("input[name=endDate]").datepicker();
	},
	render: function(){
		var tpl = _.template(wingTpl);
		$("#my-wings").append(tpl)
		$("input[name=startDate]").datepicker();
		$("input[name=endDate]").datepicker();
    },
	submitWing: function(evt){
		evt.preventDefault()
		console.log(evt.target.id)
		var data = utils.serializeForm(evt.target.id)
		console.log(data)
	}
  });

  return new wingView;
});