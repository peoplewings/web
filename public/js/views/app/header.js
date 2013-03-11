define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var headerTpl = require("tmpl!templates/app/header.html");
	var UserModel = require("models/Account");
	var notifications = require('views/lib/notifications');
	var modal = require('tmpl!templates/lib/modal.form.wings.html');

	var AppHeader = Backbone.View.extend({

		el: 'header',

		events: {
			"click #modal-apanio": function(){
				$('body').html(modal);
				$('.generic-modal').modal();
			}
		},

		initialize: function(){
			this.model = new UserModel({id: api.getUserId()});
			this.model.on("change", this.render.bind(this));
			if (!this.model.get("firstName"))
				this.model.fetch();
		},

		render: function(){
			$(this.el).html(headerTpl(this.model.toJSON()));
		},

		refresh: function(){
			this.model.fetch();
		},

		destroy: function(){
			this.remove();
			this.unbind();
		}
	});

	return AppHeader;
});
