define(function(require){
	
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var headerTpl = require("tmpl!templates/app/header.html");
	var UserModel = require("models/Account");
	
	var appHeader = Backbone.View.extend({
	
		el: 'header',
	
		initialize: function(){
			this.model = new UserModel({id: api.getUserId()});
			this.model.on("change", this.render.bind(this));
			if (!this.model.get("firstName"))
				this.model.fetch()
		},
		
		render: function(){
			debugger
			$(this.el).html(headerTpl(this.model.toJSON()));
	    },
	
		destroy: function(){
	  		this.remove();
	  		this.unbind();
		}
  	});
	
	return appHeader;
});