define([
	"jquery", 
	"backbone",
	"api",
], function($, Backbone, api) {

	var relationChoices = {
		SI: "Single",
		EN: "Engaged",
		MA: "Married",
		WI: "Widowed",
		IR: "In a relationship",
		IO: "In an open relationship",
		IC: "It's complicated",
		DI: "Divorced",
		SE: "Separated"
	}

	//Implementing a Factory Class (singleton)  
	//Source from http://stackoverflow.com/questions/11145159/implement-javascript-instance-store-by-returning-existing-instance-from-construc
	var makeStoreable = function(model){
	  var StoreModel = function(attr, opt){
	    if(!attr || !attr._id){
	      // The behavior you exhibit here is up to you
	      throw new Error('Cool Models always have IDs!');
	    }
	    if(this.store[attr._id]){
	      this.store[attr._id].set(attr, opt);
	    }else{
	      var newModel = new model(attr, opt);
	      this.store[attr._id] = newModel;
	    }
	    return this.store[attr._id];
	  };
	  StoreModel.prototype.store = {};
	  return StoreModel;
	};

	var Preview = Backbone.Model.extend({
		
		idAttribute: "_id",
		urlRoot: api.getServerUrl() + api.getApiVersion() + "/profiles/" + api.getProfileId(),
        // Model Constructor
        initialize: function() {
        },
		parse: function(resp, xhr){
			if (resp.data){
				if (resp.data.civilState) resp.data.civilState = relationChoices[resp.data.civilState]
			}
			return resp.data
		},

	});

	Preview = makeStoreable(Preview);

    // Returns the Model singleton instance
	return Preview;
});