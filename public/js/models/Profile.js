define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var api = require('api2');
	var factory = require('core/factory');

	var UserProfileModel = Backbone.Model.extend({

		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/',

		parse: function(resp, xhr){
			return resp.data
		},
		save: function(successCb){
			//Dehydratation of data to send it to server
			// Collects the interestedIn values to its array
			var gender = []
			if (this.get("Male") === true) gender.push({gender: "Male"})
			if (this.get("Female") === true) gender.push({gender: "Female"})
			this.set("interestedIn", gender)

			var langs = []
			var edus = []
			var socials = []
			var instant = []
			var id = []
			// Collects languages and educations values to its respective arrays [TODO: locations, socailnetworks, instantmessages]
			for (attr in this.attributes){
				if (attr.indexOf("x_language_") == 0){
					id = attr.split("_", 3)
					id = id[2]
					if (this.get("x_language_" + id) !== undefined){
						langs.push({ name: this.get("x_language_" + id), level: this.get("x_level_" + id)})
					}
				}
				if (attr.indexOf("x_institution_") == 0){
					id = attr.split("_", 3)
					id = id[2]
					edus.push({ institution: this.get("x_institution_" + id), degree: this.get("x_degree_" + id)})
				}
				if (attr.indexOf("x_socialNetwork_") == 0){
					id = attr.split("_", 3)
					id = id[2]
					socials.push({ socialNetwork: this.get("x_socialNetwork_" + id), snUsername: this.get("x_snUsername_" + id)})
				}
				if (attr.indexOf("x_instantMessage_") == 0){
					id = attr.split("_", 3)
					id = id[2]
					instant.push({ instantMessage: this.get("x_instantMessage_" + id), imUsername: this.get("x_imUsername_" + id)})
				}
			}
			this.set("languages", langs)
			this.set("education", edus)
			this.set("socialNetworks", socials)
			this.set("instantMessages", instant)


			var copy = this.clone()
			copy.cleanXAttrs()
			//Save a copy of UserProfile clean of X-Attributes
			var profileId = this.get("id")
			api.put(api.getApiVersion() + '/profiles/' + profileId, copy.attributes).then(successCb)
		},
		success: function(){
			console.log("You have to give feedback to the user!!", arguments)
		},
		cleanXAttrs: function(){
			for (attr in this.attributes){
				if (attr.indexOf("x_") == 0) this.unset(attr)
			}
		}
	});

    // Returns the Model singleton instance
	return factory(UserProfileModel);
});
