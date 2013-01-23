define(function(require){
	
	var $ = require("jquery");
	var Backbone = require("backbone");

	var list = Backbone.View.extend({
	
	initialize: function(options){
		this.el = options.el
		this.key = options.key
		this.values = options.values
		this.tpl = options.tpl
		this.store = options.store
		
		
		
		this.length = (this.store.length > 0) ? this.store.length : 0;
		
		this.render()
		
	},
	
	render: function(){
		var sc = this
		
		this.$(this.tpl).hide()
		

		
		var sons = $(this.el).children()
		//.not(this.tpl)
		
		
		_.each(sons, function(item, index){
			$(item).append('<button type="button" class="close" id="delete-' + sc.key + '-' + index + '">×</button>')
		})

		this.addItem()
		
		$(this.el).parent().append('<a href="#" id="add-' + this.key + '-btn" role="button">Add another</a>')
	},
	
	addItem: function(){
		var sc = this
		var added = this.$(this.tpl).clone()
		
		//added.append('<button type="button" class="close" id="delete-' + sc.key + '-' + this.length + '">×</button>')
		
		added.attr('id', this.key + "-" + this.length + "").appendTo(this.el).show()
		
		_.each(added.children('select, input, textarea'), function(item, index){
			$(item).attr("name", sc.values[index])
		})
		
		
		added.children('button').attr("id", "delete-" + this.key + "-" + this.length)
		
		this.length++
		
		return added.prop("id");

	},
	
	deleteItem: function(e){
		
		debugger
		var element = document.getElementById(e.target.id).parentNode

		$(element).remove()
		
		this.length--
		
	},

	 });

  return list;
});