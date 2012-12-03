define([
  "jquery",
  "backbone",
  "api",
  "utils",
  'text!templates/app/preview.html',
  'models/Profile',
], function($, Backbone, api, utils, previewTpl, UserProfile){
	
	var previewView = Backbone.View.extend({
		el: "#main",
		initialize: function(){
			this.model = new UserProfile({id: api.getProfileId()})
			this._modelBinder = new Backbone.ModelBinder();
		},
		render: function(){
			var scope = this
			if (!this.model.get("avatar")){
				this.model.fetch({success: function(model) { 
												scope.model = new UserProfile(model)
												scope.doRender()
											}
				})
			}else this.doRender()
		},
		doRender: function(){
			var tpl = _.template(previewTpl, {
				avatar: this.model.get("avatar"), 
				verified: this.model.get("verified"),
				current: this.model.get("current"),
				lastLoginDate: this.model.get("lastLoginDate"),
			})
			$(this.el).html(tpl);
			this._modelBinder.bind(this.model, this.el)
		}
	});

  return new previewView;
});