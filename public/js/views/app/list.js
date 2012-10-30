define([
  "jquery",
  "backbone",
  "models/Profile",
], function($, Backbone, UserProfile){

  var list = Backbone.View.extend({
	initialize: function(options){
		this.model = new UserProfile({id:"me"})
		this.el = options.el
		this.store = options.items
		this.tpl = options.tpl
		//Used like an autoincremental Id 
		this.storeSize = options.items.length + 1 | 1
		this.keys = options.keys
		this.itemId = options.itemId
		this.extraCls = options.extraCls
		//console.log("List definition:", this.itemId, this.keys, this.storeSize)
	},
	render: function(opts){
		var sc = this
		if (this.store.length > 0){
			$.each(this.store, function(i, field){
				$(sc.el).append(_.template(sc.tpl, {index: i + 1, itemId: sc.itemId, extraAttribute: 'disabled="true"'}))
			})
			this.bind()
		}
		this.setInitial()
    },
    setInitial: function(){
		$(this.el).append(_.template(this.tpl, {index: this.storeSize, itemId: this.itemId, extraCls: this.extraCls}))
		this.model.bindings["x_" + this.keys[0] + "_" + this.storeSize] = "[name=" + this.keys[0] + "-" + this.storeSize + "]"
		this.model.bindings["x_" + this.keys[1] + "_" + this.storeSize] = "[name=" + this.keys[1] + "-" + this.storeSize + "]"
	},
	bind: function(){
		var sc = this
		var s
		$.each(this.store, function(key, field){
			s = key + 1 + ""
			$.each(field, function(key, element){
				sc.model.bindings["x_" + key + "_" + s] = '[name=' + key + '-' + s +']'
			})
		})
	},
	addItem: function(keys){
		this.storeSize++
		var last = this.storeSize
		$(this.el).append(_.template(this.tpl, {index: last, itemId: this.itemId, extraCls: this.extraCls}))
		this.model.bindings["x_" + this.keys[0] + "_" + last] = "[name=" + this.keys[0] + "-" + last + "]"
		this.model.bindings["x_" + this.keys[1] + "_" + last] = "[name=" + this.keys[1] + "-" + last + "]"
	},
	deleteItem: function(nodeId){
		var id = nodeId.split("-", 3)
		id = id[id.length-1]
		delete this.model.bindings["x_" + this.keys[0] + "_" + id]
		delete this.model.bindings["x_" + this.keys[1] + "_" + id]
		this.model.unset("x_" + this.keys[0] + "_" + id)
		this.model.unset("x_" + this.keys[1] + "_" + id)
		$("#" + this.itemId + "-" + id).remove()
	},
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return list;
});