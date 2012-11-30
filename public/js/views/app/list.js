define([
  "jquery",
  "backbone",
  "api",
  "models/Profile",
], function($, Backbone, api, UserProfile){

  var list = Backbone.View.extend({
	initialize: function(options){
		this.model = new UserProfile({id: api.getProfileId()})
		this.el = options.el
		this.store = options.items
		this.tpl = options.tpl
		//Used like an autoincremental Id 
		this.storeSize = options.items.length + 1 | 1
		this.keys = options.keys
		this.itemId = options.itemId
		this.extraCls = options.extraCls
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
		var sc = this
		$(this.el).append(_.template(this.tpl, {index: this.storeSize, itemId: this.itemId, extraCls: this.extraCls}))
		$.each(this.keys, function(key, element){
			sc.model.bindings["x_" + element + "_" + sc.storeSize] = "[name=" + element + "-" + sc.storeSize + "]"
		})
	},
	bind: function(){
		var sc = this
		var s
		$.each(this.store, function(key, field){
			s = key + 1 + ""
			$.each(sc.keys, function(key, element){
				sc.model.bindings["x_" + element + "_" + s] = '[name=' + element + '-' + s +']'
			})
		})
	},
	addItem: function(keys){
		this.storeSize++
		var last = this.storeSize
		var sc = this
		$(this.el).append(_.template(this.tpl, {index: last, itemId: this.itemId, extraCls: this.extraCls}))
		$.each(this.keys, function(key, element){
			sc.model.bindings["x_" + element + "_" + last] = "[name=" + element + "-" + last + "]"
		})
	},
	deleteItem: function(nodeId){
		var id = nodeId.split("-", 3)
		var sc = this
		id = id[id.length-1]
		$.each(this.keys, function(key, element){
			delete sc.model.bindings["x_" + element + "_" + id]
			sc.model.unset("x_" + element + "_" + id)
		})
		$("#" + this.itemId + "-" + id).remove()
	},
	destroy: function(){
  		this.remove();
  		this.unbind();
	}
  });

  return list;
});