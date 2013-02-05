define(function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");

    var list = Backbone.View.extend({

        initialize: function(options) {
            this.el = options.el
            this.key = options.key
            this.$tpl = $(options.tpl)
            this.store = options.store

            this.length = (this.store.length > 0) ? this.store.length: 0;

            this.render()
        },

        render: function() {
            var sc = this

            this.$tpl.remove()

            var sons = $(this.el).children()

            _.each(sons,
            function(item, index) {
                $(item).append('<button type="button" class="close" id="delete-' + sc.key + '-' + index + '">×</button>')
            })

            $(this.el).parent().append('<a href="#" id="add-' + this.key + '-btn" role="button">Add another</a>')

            if (this.length == 0) this.addItem()
        },

        addItem: function() {
            var sc = this
            var added = this.$tpl.clone()

            added.attr('id', this.key + "-" + this.length + "").appendTo(this.el).show()

            added.append('<button type="button" class="close" id="delete-' + this.key + '-' + this.length + '">×</button>')

            added.show()

            this.length++

            return added.prop("id");
        },

        deleteItem: function(e) {

            var element = document.getElementById(e.target.id).parentNode

            $(element).remove()

            this.length--
        },

    });

    return list;

});