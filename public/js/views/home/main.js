define([
  'jquery',
  'backbone',
  'text!templates/home/main.html',
  'text!templates/home/accomodation.html',
], function($, Backbone, mainHomeTpl, accomodationTpl){

  var mainHomeView = Backbone.View.extend({
    el: "#main",
    render: function(){
      $(this.el).html(mainHomeTpl);
      $("#accomodation").html(accomodationTpl)
    }
  });
  return new mainHomeView;
});
