define(function(require){
	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");

	var carouselTpl = require('tmpl!templates/app/profile/carousel.html');

	var Carousel = Backbone.View.extend({
		//model:
		//id: select image
		tagName: 'div',
		initialize: function(options){
			this.render();
			this.activeImg();
		},

		events: {
			'click #overlay' : 'hide'
		},

		render: function(){
			this.$el.attr('id', 'carousel');
			this.$el.append(carouselTpl(this.model.toJSON()) );

			this.$el.css({
			    'position': 'fixed',
			    top: 0,
			    right: 0,
			    bottom: 0,
			    left: 0,
			    'z-index': 4000
			});

			this.$('#overlay').css({
				'background-color': 'black',
				'opacity': '0.6',
				'width': '100%',
				'height': '100%'
			});

			this.$('#myCarousel').css({
				'position': 'fixed',
				'top': 0
			});

		},

		show: function(){
			this.activeImg();
			this.$el.show();
		},

		hide: function(){
			this.$el.hide();
		},

		activeImg: function(){
			this.$('.active').removeClass('active');
			//this.$('.carousel-indicators li:nth-child('+ (this.options.id+1) +')').addClass('active');
			this.$('.carousel-inner div:nth-child('+ (this.options.id+1) +')').addClass('active');
		}
	});

	return Carousel;
})