define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'views/app/home',
  'text!templates/app/settings.html',
  'text!templates/lib/alert.html',
  "models/User",
], function($, Backbone, utils, api, homeView, settingsTpl, alertTpl, UserModel){


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
		this.model.bindings = {
			firstName: '[name=firstName]',
            lastName: '[name=lastName]',
            email: '[name=email]',
		}
		this._modelBinder = new Backbone.ModelBinder();
		
		//this.model.on("change", this.render)
	},
    render: function(){
      $(this.el).html(settingsTpl);
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
	  
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
	close: function(){ 
		this._modelBinder.unbind()
	},
	loadSettings: function(){
		
	},
	submitSettings: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm('settings-form')
		var values = { firstName: data.firstName, lastName: data.lastName }
		
		if (data.newEmail) values.email = data.newEmail
		if (data.newPassword) values.password = data.newPassword
				
		var sc = this
		api.put(api.getApiVersion() + '/accounts/me', { resource: values, currentPassword: data.password }, function(response){ 
			$('.alert').remove()
			var tpl
			if (response.status === true) {
				tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
			}else tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg + ": ", message: 'Please try again later'})
			$('#settings-form')[0].reset()

			for (val in values) sc.model.set(val, values[val])
			
			$('#firstName').val(sc.model.get("firstName"))
			$('#lastName').val(sc.model.get("lastName"))
			
			$('#main').prepend(tpl)
			
		})
	},
	deleteAccount: function(){
		var data = utils.serializeForm('delete-account-form')
		var goodbye = function(resp){
			if (resp.status === true) {
				$('#myModal').modal('hide')
				require(["views/app/logout"], function(logoutView){
					logoutView.goodbye()
				})
			}
			else{
				$('.alert').remove()
				var tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: resp.msg + ": ", message: 'Please retype your password'})
				$('#myModal > .modal-body').prepend(tpl)
				//console.log(resp.msg)
			} 
		}
		if ($('#delete-account-form').valid()) api.delete(api.getApiVersion() + '/accounts/me', data, goodbye)
	}
  });

  return new settingsView;
});