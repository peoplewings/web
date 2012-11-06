define([
  'jquery',
  'backbone',
  'utils',
  'text!templates/home/main.html',
  'text!templates/home/accomodation.html',
], function($, Backbone, utils, mainHomeTpl, accomodationTpl){

  var mainHomeView = Backbone.View.extend({
    el: "#main",
	events: {
		"submit form#accomodation-form": "submitSearch",
	},
    render: function(){
      $(this.el).html(mainHomeTpl);
      $("#accomodation").html(accomodationTpl)
    },
	submitSearch: function(e){
		e.preventDefault()
		console.log('Submit Search: #' + e.target.id)
	}
  });
  return new mainHomeView;
});
