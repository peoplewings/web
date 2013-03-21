define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var headerTpl = require("tmpl!templates/app/header.html");
	var UserModel = require("models/Account");

	var AppHeader = Backbone.View.extend({

		el: 'header',

		events: {
			'keyup #header-search': function(event) {
				if (event.keyCode !== 13)
					return;

				var $target = $(event.target);
				var filter = $target.val() ? '&wings=' + $target.val() : '';
				$target.val('');
				$target.blur();
				document.location.hash = '/search/?capacity=1&language=all&type=Host&gender=Both&page=1&startAge=18&endAge=98' + filter;
			}
		},

		initialize: function(){
			this.model = new UserModel({id: api.getUserId()});
			this.model.on("change", this.render.bind(this));
			this.model.fetch();
			this.searchVisible = true;
		},

		render: function(){
			$(this.el).html(headerTpl(this.model.toJSON()));
			this.showSearch(this.searchVisible);
		},

		refresh: function(){
			this.model.fetch();
		},

		destroy: function(){
			this.remove();
			this.unbind();
		},

		showSearch: function(state) {
			this.searchVisible = state;
			this.$('#header-search')[ state ? 'show' : 'hide' ]();
		}
	});

	return AppHeader;
});
