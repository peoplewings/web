define([
  'jquery',
  'underscore',
  'backbone',
  'api',
  'views/lib/handlers',
  'views/lib/response',
], function($, _, Backbone, api, handlersV, responseView){

  var activateView = Backbone.View.extend({
    render: function(token){
		var data = { activationKey: token }
		handlersV.submitForm(undefined, api.getApiVersion() + '/activation', data, responseView, 
				{ 
					legend: "Account activation complete",
					msg: "You can now log in into PEOPLEWINGS with your credentials"
				})
    },
  });

  return new activateView;
});