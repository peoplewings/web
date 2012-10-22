define([
	"jquery", 
	"backbone",
	"api",
], function($, Backbone, api) {

    var User = Backbone.Model.extend({
		
		urlRoot: 'http://peoplewings-backend.herokuapp.com/api/v1/accounts/',
        // Model Constructor
        initialize: function() {
	
	
			/*this.on("change:firstName", function(model){
                var name = model.get("firstName"); // 'Sergio'
                alert("Changed my name to " + name );
            });*/
        },
		// To set the JSON root of the model
		parse: function(resp, xhr){
			return resp.data
		},

        // Default values for all of the User Model attributes
        defaults: {

            firstName: "",

            lastName: "",

            email: "",

            //phone: ""

        },

		/*
        // RegEx Patterns
        // ==============
        patterns: {

            specialCharacters: "[^a-zA-Z 0-9]+",

            digits: "[0-9]",

            email: "^[a-zA-Z0-9._-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*[.]{1}[a-zA-Z]{2,6}$",

            phone: "^([0-9]{3})?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"

        },

        // Validators
        // ==========
        validators: {

            minLength: function(value, minLength) {

                return value.length >= minLength;

            },

            maxLength: function(value, maxLength) {

                return value.length <= maxLength;

            },

            pattern: function(value, pattern) {

                return new RegExp(pattern, "gi").test(value) ? true : false;

            },

            isEmail: function(value) {
  
               return User.prototype.validators.pattern(value, User.prototype.patterns.email);

            },

            isPhone: function(value) {

                return User.prototype.validators.pattern(value, User.prototype.patterns.phone);

            },

            hasSpecialCharacter: function(value) {
  
                return User.prototype.validators.pattern(value, User.prototype.patterns.specialCharacters);

            },

            hasDigit: function(value) {
                  
                return User.prototype.validators.pattern(value, User.prototype.patterns.digits);

            }

        },

        // Validate
        // ========
        validate: function(attrs) {
          
            if(attrs.firstName != null) {
                if (!attrs.firstName) return { field: "firstname", error: "First name is required" };
                else if(!this.validators.minLength(attrs.firstName, 2)) return { field: "firstname", error: "First name is too short" };
                else if(!this.validators.maxLength(attrs.firstName, 15)) return { field: "firstname", error: "First name is too large" };
                else if(this.validators.hasSpecialCharacter(attrs.firstName)) return { field: "firstname", error: "First name cannot contain special characters" };
            }

            if(attrs.lastName != null) {

                if (!attrs.lastName) return { field: "lastname", error: "Last Name is required" };
                else if(!this.validators.minLength(attrs.lastName, 2)) return { field: "lastname", error: "Last name is too short" };
                else if(!this.validators.maxLength(attrs.lastName, 15)) return { field: "lastname", error: "Last name is too large" };
                else if(this.validators.hasSpecialCharacter(attrs.lastName)) return { field: "lastname", error: "Last name cannot contain special characters" };  

            }        
              
            if(attrs.email != null) {

                if (!attrs.email) return { field: "email", error: "Email is required" };
                else if(!this.validators.isEmail(attrs.email)) return { field: "email", error: "Email is not valid" };

            }
            
            if(attrs.phone != null) {

                if(!attrs.phone) return { field: "phone", "error": "Phone number is required" };
                else if(!this.validators.isPhone(attrs.phone)) return { field: "phone", error: "Phone Number is invalid" };

            }

        }*/

    });

    // Returns the Model class
    //return User;
	return false;

});