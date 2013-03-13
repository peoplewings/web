define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");

	var List = Backbone.View.extend({

		initialize: function(options) {
			this.el = options.el;
			this.key = options.key;
			this.$tpl = $(options.tpl);
			this.store = options.store;

			this.length = (this.store.length > 0) ? this.store.length: 0;
			this.render();
		},

		render: function() {
			var self = this;
			this.$tpl.remove();

			_.each($(this.el).children(), function(item, index) {
				$(item).prepend('<button type="button" class="close" id="delete-' + self.key + '-' + index + '">×</button>');
			});

			$(this.el).parent().append('<a href="#" id="add-' + this.key + '-btn" role="button" class="another">Add another</a>');
			if (!this.length)
				this.addItem();
		},

		addItem: function() {
			this.length++;

			return this.$tpl.clone()
				.attr('id', this.key + "-" + this.length + "")
				.appendTo(this.el)
				.prepend('<button type="button" class="close" id="delete-' + this.key + '-' + this.length + '">×</button>')
				.show()
				.prop("id");
		},

		deleteItem: function(e) {
			$(e.target).parent().remove();
			this.length--;

			var index = +e.target.id.split(this.key + "-")[1];
			this.store.splice(index, 1);
		},

	});

	return List;

});
