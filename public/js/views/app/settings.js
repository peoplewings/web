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
		"click a[href='#myModal']": function(){ $('#myModal').modal({show:false}) },
		"click button#delete-account-btn": "deleteAccount",
	},
	initialize: function(options){
		this.model = new UserModel({id:"me"})
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
	  $('#settings-form').validate({
			rules: {
				newPassword: {
		            minlength: 6
		        },
		        repeatNewPassword: {
		            minlength: 6,
		            equalTo: "#pass"
		        },
				//newEmail: { equalTo: '#inputRepeatNewEmail'},
				newEmail: { email: true},
				repeatNewEmail: {email: true, equalTo: '#inputNewEmail'},
				//newPassword: {required: true},
				//repeatNewPassword: { required: true, equalTo: '#newPassword'},

			}
		})
	  //console.log(this.model.attributes)
	  this._modelBinder.bind(this.model, this.el, this.model.bindings)
    },
	close: function(){ 
		this._modelBinder.unbind()
	},
	loadSettings: function(){
		
	},
	submitSettings: function(e){
		e.preventDefault(e);
		var data = utils.serializeForm('settings-form')
		/*if ($('#settings-form').validate()) console.log('Valid')
		else console.log('Invalid')*/
		//{"current_password":"asdf", "resource":{"email":"asdf", "password":"qwert", "lastName":"lol"}}
		//POST credentials
		//api.post('/auth/', data, this.success(data.remember))
		//Start loader
		//spinner.spin(document.getElementById('main'));
		//$('#' + e.target.id).remove()
		console.log(data)
		var values = { firstName: data.firstName, lastName: data.lastName }
		if (data.newEmail) values.email = data.newEmail
		if (data.newPassword) values.password = data.newPassword
				
		var sc = this
		api.put('/accounts/me', { resource: values, currentPassword: data.password }, function(response){ 
			$('.alert').remove()
			var tpl
			if (response.status === true) {
				tpl = _.template(alertTpl, {extraClass: 'alert-success', heading: response.msg})
			}else tpl = _.template(alertTpl, {extraClass: 'alert-error', heading: response.msg + ": ", message: 'Please try again later'})
			sc.render()
			$('#main').prepend(tpl)
		})
	},
	deleteAccount: function(){
		console.log('deleteAccount')
		var data = utils.serializeForm('delete-account-form')
		console.log(data)
		var goodbye = function(resp){
			if (resp.status === true) console.log('goodbye')
			else console.log(resp.msg)
		}
		api.delete('/accounts/me', data, goodbye)
	}
  });

  return new settingsView;
});