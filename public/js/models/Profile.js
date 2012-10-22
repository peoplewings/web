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
		//urlRoot: 'templates/me/',
        // Model Constructor
        initialize: function() {

        },
		// To set the JSON root of the model
		parse: function(resp, xhr){
			//Data before tampering it and returning to cB
			console.log(resp.data) 
			resp.data.id = "me"
			resp.data.interestedInM = false
			resp.data.interestedInF = false
			switch (resp.data.interestedIn){ 
				case "M": 
				resp.data.interestedInM = true
				break
				case "F": 
				resp.data.interestedInF = true
				break
				case "B": 
				resp.data.interestedInM = true
				resp.data.interestedInF = true
				break
			}
			var s
			$.each(resp.data.languages, function(i, field){
				s = i + 1 + ""
				resp.data["language_" + s] = field.language
				resp.data["level_" + s] = field.level
			})
			return resp.data
		},

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