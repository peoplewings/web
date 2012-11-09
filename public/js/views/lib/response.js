define([
  'jquery',
  'backbone',
  'text!templates/lib/response.html',
], function($, Backbone, Tpl, form){

  var responseView = Backbone.View.extend({
    render: function(data){
        var template = _.template( Tpl, data );
		$(this.el).html( template );
    }
  });
  return new responseView;
});
