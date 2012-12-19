define(function(require){

	var $ = require("jquery");
	var Backbone = require("backbone");
	var api = require("api2");
	var profileTpl = require("text!templates/app/preview.html");
	var ProfilePreview = require("models/ProfilePreview")
	
	var userProfile = Backbone.View.extend({
		el: "#main",
		initialize: function(userId){
			this.model = new ProfilePreview({_id: userId })
			this._modelBinder = new Backbone.ModelBinder();
			this.render = this.render.bind(this)
			this.setTemplate = this.setTemplate.bind(this)
			
			api.get('/api/v1/profiles/' + userId + '/preview')
				.prop('data')
				.then(this.setTemplate)
				.then(this.render);
		},
		setTemplate: function(){
			var tpl = _.template(previewTpl, {
				birthday: bDay,
				hometown: this.model.get("hometown"), 
				avatar: this.model.get("avatar"), 
				verified: this.model.get("verified"),
				current: this.model.get("current"),
				otherLocations: this.model.get("otherLocations"),
				languages: this.model.get("languages"),
				lastLoginDate: this.model.get("lastLoginDate"),
				interestedIn: this.model.get("interestedIn")[0].gender, //Fix this shit please
				education: this.model.get("education"),
				wings: this.wingsList,
				status_choices: {  Y: 'Yes', N: 'No', M: 'Maybe'},
				sleep_choices: { C: "Common area", P: "Private area", S: "Shared private area"},
				smoking_choices: { S: 'I smoke', D: "I don't smoke, but guests can smoke here", N: "No smoking allowed"}

			})
			return tpl
		},
		render: function(tpl){
			console.log(tpl)
			$(this.el).html(tpl)
		},
		destroy: function(){
			this.remove()
			this.unbind()
		}
	});
	
	return userProfile;
});
