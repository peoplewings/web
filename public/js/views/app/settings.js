define(function(require){
	
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var settingsTpl = require("tmpl!templates/app/settings.html")
	var alertTpl = require("tmpl!templates/lib/alert.html")
	var UserModel = require("models/Account")
	
	var settingsView = Backbone.View.extend({
		
    	el: "#main",

		events:{
			"submit form#settings-form": "submitSettings",
			"click a[href='#myModal']": function(){ 
										$('.alert').remove()
										$('#myModal').modal({show:false}) 
									},
			"click button#delete-account-btn": "deleteAccount",
		},
		
		initialize: function(options){
			this.model = new UserModel({id:api.getUserId()})
			this.model.on("change", this.render.bind(this));
		},
		
	    render: function(){
			$(this.el).html(settingsTpl(this.model.toJSON()));
		
			$('#settings-form').validate({
				rules: {
					newPassword: {
			            minlength: 6
			        },
			        repeatNewPassword: {
			            minlength: 6,
			            equalTo: "#pass"
			        },
					newEmail: { email: true},
					repeatNewEmail: {email: true, equalTo: '#inputNewEmail'},
				}
			})
			$('#delete-account-form').validate({
				rules: {
					currentPassword: {
			            required: true,
			        }
				}
			})
	    },
	
		submitSettings: function(e){
			e.preventDefault(e);
			var tpl = null
			var data = utils.serializeForm('settings-form')
			var values = { firstName: data.firstName, lastName: data.lastName }
		
			if (data.newEmail) values.email = data.newEmail
			if (data.newPassword) values.password = data.newPassword
				
			this.model.save(values, data.password)
				.then(function(status){
					if (status === true){
						tpl = alertTpl({extraClass: 'alert-success', heading: "Account updated"})
					} else {
						tpl = alertTpl({extraClass: 'alert-error', heading: "Account couldn't be updated" + ": ", message: 'Please try again later'})
					}
				})
				.fin(function(){
					$('#settings-form')[0].reset()
					$("#main").prepend(tpl)
				})
		},
		
		deleteAccount: function(){
			if ($('#delete-account-form').valid()){
				var data = utils.serializeForm('delete-account-form')
				
				this.model.destroy(data)
					.then(function(status){
						if (status === true){
							$('#myModal').modal('hide')
							require(["views/app/logout"], function(logoutView){
								logoutView.goodbye()
							})
						} else {
							$('.alert').remove()
							var	tpl = alertTpl({extraClass: 'alert-error', heading: "Couldn't delete your account" + ": ", message: 'Please retype your password'})
							$('#myModal > .modal-body').prepend(tpl)
							$('#delete-account-form')[0].reset()
						}
					})
			} else 
				return;
		}
	});
	
	return new settingsView;
	
});