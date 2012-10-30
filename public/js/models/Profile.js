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
		
		urlRoot: 'http://peoplewings-backend.herokuapp.com/api/v1/profiles/',
		
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
					resp.data["x_language_" + s] = field.name
					resp.data["x_level_" + s] = field.level
				})
				$.each(resp.data.education, function(i, field){
					s = i + 1 + ""
					resp.data["x_institution_" + s] = field.institution
					resp.data["x_degree_" + s] = field.degree
				})
			}
			
			return resp.data
		},
		save: function(attributes, options){
			//Dehydratation of data to send it to server
			// Collects the interestedIn values to its array
			var gender = []
			if (this.get("Male") === true) gender.push({gender: "Male"})
			if (this.get("Female") === true) gender.push({gender: "Female"})
			this.set("interestedIn", gender)
			
			var langs = []
			var edus = [] 
			var id = []
			// Collects languages and educations values to its respective arrays [TODO: locations, socailnetworks, instantmessages]
			for (attr in this.attributes){
				if (attr.indexOf("x_language_") == 0){
					id = attr.split("_", 3)
					id = id[2]
					langs.push({ name: this.get("x_language_" + id), level: this.get("x_level_" + id)})
				}
				if (attr.indexOf("x_institution_") == 0){
					id = attr.split("_", 3)
					id = id[2]
					edus.push({ institution: this.get("x_institution_" + id), degree: this.get("x_degree_" + id)})
				}
			}
			this.set("languages", langs)
			this.set("education", edus)
			
			
			var copy = this.clone()
			copy.cleanXAttrs()
			//Save a copy of UserProfile clean of X-Attributes
			var profileId = this.get("id")
			api.put('/profiles/' + profileId, copy.attributes, this.success)
			
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