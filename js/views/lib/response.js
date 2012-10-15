define([
  'jquery',
  'backbone',
  'text!templates/lib/response.html',
], function($, Backbone, Tpl, form){

  var responseView = Backbone.View.extend({
    render: function(data, extraData){
		//console.log(data)
		//console.log(extraData)
        var template = _.template( Tpl, data );
		if (extraData) template = _.template( template, extraData );
		$(this.el).html( template );
    }
  });
  return new responseView;
});
