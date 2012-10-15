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
    },

	submitRegister: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm(e.target.id)
		//console.log(data)
		handlersV.submitForm(e, 'newuser', data, responseView, 
			{ 
				legend: "Confirm your e-mail address",
				msg: "A confirmation email has been sent to <b><%- email %></b>. Click on the confirmation link in the email to activate your account",
			})
	}

  });

  return new registerView;
});
