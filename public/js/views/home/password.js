define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'views/lib/handlers',
  'views/lib/response',
  'text!templates/lib/mailform.html',
  'text!templates/lib/passform.html'
], function($, Backbone, utils, api, handlersV, responseView, mailTpl, passTpl){
	
  var spinner = new Spinner(utils.getSpinOpts());

  var passwordView = Backbone.View.extend({
	el: "#main",
	events:{
		"submit form#forgot-form": "submitForgot",
		"submit form#password-form": "submitNewPwd"
	},
    render: function(token){
		var tpl = (token) ? _.template( passTpl, {token: token} ) : _.template( mailTpl );
		$(this.el).html( tpl );
    },
	submitForgot: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm(e.target.id)
		
		handlersV.submitForm(e, '/forgot', data, responseView, 
			{ 
				legend: "Check your inbox for the reset link",
				msg: "We've sent you an e-mail that will allow you to reset your password quickly and easily",
			})
	},
	submitNewPwd: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm(e.target.id)

		handlersV.submitForm(e, '/forgot', {forgotToken: data.forgotToken, newPassword: data.newPassword}, responseView, 
			{ 
				legend: "Password changed",
				msg: "You can now log in with your new password",
			})
	}
  });
  return new passwordView;
});