//jshint camelcase:false

define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var utils = require("utils");
	var headerTpl = require("tmpl!templates/app/header.html");
	var UserModel = require("models/Account");

	var AppHeader = Backbone.View.extend({

		el: 'header',

		initialize: function(){
			this.model = new UserModel({id: api.getUserId()});
			this.model.on("change", this.render.bind(this));
			this.model.fetch();
			this.searchVisible = true;
		},

		render: function(){
			$(this.el).html(headerTpl(this.model.toJSON(), {lastName: this.model.get('lastName')[0] + '.'}));

			this.search = new google.maps.places.Autocomplete(document.getElementById("header-search"), { types: ['(cities)'] });
			google.maps.event.addListener(this.search, 'place_changed', this.doSearch.bind(this));
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
			this.$('#header-search').val('');
		},

		doSearch: function(){
			var $header = this.$('#header-search');
			var cc = utils.getCityAndCountry(this.search.getPlace().address_components);
			if (!cc) return;
			$header.val('');
			$header.blur();
			document.location.hash = '/search/people/?location=' + cc.city;
		}
	});

	return AppHeader;
});
