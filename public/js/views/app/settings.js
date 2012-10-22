define([
  'jquery',
  'backbone',
  'utils',
  'api',
  'views/app/home',
  'text!templates/app/settings.html',
  "models/User",
], function($, Backbone, utils, api, homeView, settingsTpl, UserModel){


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
	  console.log(this.model.attributes)
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
		console.log(data)
		//{"current_password":"asdf", "resource":{"email":"asdf", "password":"qwert", "lastName":"lol"}}
		//POST credentials
		//api.post('/auth/', data, this.success(data.remember))
		//Start loader
		//spinner.spin(document.getElementById('main'));
		//$('#' + e.target.id).remove()
		var values = {
			firstName: data.firstName, 
			lastName: data.lastName
		}
		if (data.newEmail) values.email = data.newEmail
		if (data.newPassword) values.password = data.newPassword
				
		console.log({ resource: values, currentPassword: data.password })
		api.put('/accounts/me', { resource: values, currentPassword: data.password }, function(response){ 
			console.log(response.msg)
			console.log(response.errors) 
			//Refrescar vista!
		})
	},
	success: function(loggedIn){
		return function(response){
			//spinner.stop()
			if (response.status===true) {
				if (response.code === 200) {
					console.log(response)
				}
			}else {
					for ( error in response.error){
						console.error("Server said: " + error + " : " + response.error[error])
					
					}
			
			}
		}	
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