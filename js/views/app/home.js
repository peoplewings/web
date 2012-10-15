define([
  "jquery",
  "backbone",
  "api",
  "utils",
  "views/app/header",
  "views/home/main",
  //'text!templates/app/header.html'
], function($, Backbone, api, utils, appHeader, mainView){
	
  var homeView = Backbone.View.extend({
    render: function(firstName, lastName){
		var spinner = new Spinner(utils.getSpinOpts());
		
		spinner.spin(document.getElementById('main'));
		
		api.get('/accounts/me/', {}, function(response){
			spinner.stop()
			appHeader.render(response.data.firstName, response.data.lastName)
			$('header').html(appHeader.el)
			mainView.render()
		})
	  
    }
  });

  return new homeView;
});