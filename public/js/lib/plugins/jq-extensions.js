define(function(require) {
	
    $.validator.addMethod("validpassword", function(value, element) {
        return this.optional(element) ||
        /^.*(?=.*\d)(?=.*[a-zA-Z]).*$/.test(value)
    },
    "Password too weak: use digits and letters");

});