define([
	"jquery", 
	"backbone",
	"api",
], function($, Backbone, api) {

	//Implementing a Factory Class (singleton)  
	//Source from http://stackoverflow.com/questions/11145159/implement-javascript-instance-store-by-returning-existing-instance-from-construc
	var makeStoreable = function(model){
	  var StoreModel = function(attr, opt){
	    if(!attr || !attr.id){
	      // The behavior you exhibit here is up to you
	      throw new Error('Cool Models always have IDs!');
	    }
	    if(this.store[attr.id]){
	      this.store[attr.id].set(attr, opt);
	    }else{
	      var newModel = new model(attr, opt);
	      this.store[attr.id] = newModel;
	    }
	    return this.store[attr.id];
	  };
	  StoreModel.prototype.store = {};
	  return StoreModel;
	};

	var UserProfileModel = Backbone.Model.extend({
		
		urlRoot: api.getServerUrl() + api.getApiVersion() + '/profiles/',
		
        initialize: function() {
			
        },
		// To set the JSON root of the model
		parse: function(resp, xhr){
			//Hydratation of data recived
			//hydratates interestedIn, languages, education arrays, [TODO: locations. socialNetworks, instantMessages]
			if (resp.data){
				resp.data["Male"] = false
				resp.data["Female"] = false
				
				$.each(resp.data.interestedIn, function(i, field){
					var gender = field.gender
					resp.data[gender] = true
				})
				var s
				$.each(resp.data.languages, function(i, field){
					s = i + 1 + ""
					resp.data["x_language_" + s] = field.name[0].toUpperCase() + field.name.slice(1)
					resp.data["x_level_" + s] = field.level
				})
				$.each(resp.data.education, function(i, field){
					s = i + 1 + ""
					resp.data["x_institution_" + s] = field.institution
					resp.data["x_degree_" + s] = field.degree
				})
				$.each(resp.data.socialNetworks, function(i, field){
					s = i + 1 + ""
					resp.data["x_socialNetwork_" + s] = field.socialNetwork
					resp.data["x_snUsername_" + s] = field.snUsername
				})
				$.each(resp.data.instantMessages, function(i, field){
					s = i + 1 + ""
					resp.data["x_instantMessage_" + s] = field.instantMessage
					resp.data["x_imUsername_" + s] = field.imUsername
				})
				$.each(resp.data.otherLocations, function(i, field){
					s = i + 1 + ""
					resp.data["x_name_" + s] = field.name + ", " + field.country
				})
				if (!$.isEmptyObject(resp.data['current'])){
					resp.data['x_current'] = resp.data['current'].name + ", " + resp.data['current'].region + ", " + resp.data['current'].country
					//resp.data['x_current_lat'] = resp.data['current'].lat
					//resp.data['x_current_lon'] = resp.data['current'].lon
				}else{
					resp.data['x_current'] = ""
				}
				if (!$.isEmptyObject(resp.data['hometown'])){
					resp.data['x_hometown'] = resp.data['hometown'].name + ", " + resp.data['hometown'].region + ", " + resp.data['hometown'].country
					//resp.data['x_hometown_lat'] = resp.data['hometown'].lat
					//resp.data['x_hometown_lon'] = resp.data['hometown'].lon
				} else {
					resp.data['x_hometown'] = ""
				}
			}
			
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
			api.put(api.getApiVersion() + '/profiles/' + profileId, copy.attributes, successCb)
			
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

	UserProfileModel = makeStoreable(UserProfileModel);

    // Returns the Model singleton instance
	return UserProfileModel;
});