define([
  'jquery',
  'backbone',
  'api',
  'utils',
  'views/lib/handlers',
  'views/lib/response',
  'text!templates/home/register.html',
], function($, Backbone, api, utils, handlersV, responseView, registerTpl){
	
  var registerView = Backbone.View.extend({
    el: "#main",
	events:{
		"submit form#register-form": "submitRegister"
	},

    render: function(){
      $(this.el).html(registerTpl);
      $('#register-form').validate()
    },

	submitRegister: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm(e.target.id)
		handlersV.submitForm(e.target.id, api.getApiVersion() + '/newuser', data, responseView, 
			{ 
				legend: "Confirm your e-mail address",
				msg: "A confirmation email has been sent to ",
				extraInfo: data.email
		})
	}

  });

  return new registerView;
});
