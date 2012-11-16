define([
	"jquery", 
	"backbone",
    "views/app/header",
], function($, Backbone, headerView) {

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

	var UserModel = Backbone.Model.extend({
		
		urlRoot: api.getServerUrl() + api.getApiVersion() + '/accounts/',
        // Model Constructor
        initialize: function() {
			this.on("change", function(headerView){
				return function(model){
                headerView.render()
                console.log("Changed my name to " + name );
				}
            });
        },
		// To set the JSON root of the model
		parse: function(resp, xhr){
			return resp.data
		},
	});

	UserModel = makeStoreable(UserModel);

    // Returns the Model singleton instance
	return UserModel;
});