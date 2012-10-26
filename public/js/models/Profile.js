define([
	"jquery", 
	"backbone",
	"api",
	"views/app/profile",
], function($, Backbone, api, profileView) {

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
			//this.languages

        },
		// To set the JSON root of the model
		parse: function(resp, xhr){
			//Data before tampering it and returning to cB
			console.log(resp.data)
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
					resp.data["language_" + s] = field.name
					resp.data["level_" + s] = field.level
				})
				$.each(resp.data.education, function(i, field){
					s = i + 1 + ""
					resp.data["institution_" + s] = field.institution
					resp.data["degree_" + s] = field.degree
				})
			}
			/*$.each(resp.data.interestedIn, function(i, field){
				s = i + 1 + ""
				resp.data["institution_" + s] = field.institution
				resp.data["degree_" + s] = field.degree
			})*/
			return resp.data
		},
		save: function(attributes, options){
			if (this.get("interestedInM") === true && this.get("interestedInF") === true){ 
				
				this.set("interestedIn", [{gender: "Male"}, {gender: "Female"}])
				
			} else if (this.get("interestedInM") === true){
				
				this.set("interestedIn", [{gender: "Male"}])
				
			} else if (this.get("interestedInF") === true){
				
				this.set("interestedIn", [{gender: "Female"}])
				
			} else this.set("interestedIn", [])
			
			Backbone.Model.prototype.save.call(this, attributes, options);
		}
        // Default values for all of the User Model attributes
        /*defaults: {
            firstName: "",
            lastName: "",
            email: "",
        },*/
	});

	UserProfileModel = makeStoreable(UserProfileModel);

    // Returns the Model singleton instance
	return UserProfileModel;
});