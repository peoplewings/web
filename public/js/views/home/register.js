define(function(require) {

    var $ = require('jquery');
    var Backbone = require('backbone');
    var api = require('api2');
    var utils = require('utils');
    var handlersV = require('views/lib/handlers');
    var responseView = require('views/lib/response');
    var registerTpl = require('tmpl!templates/home/register.html')

    var registerView = Backbone.View.extend({

        el: "#main",

        events: {
            "submit form#register-form": "submitRegister"
        },

        validation: {
            rules: {
                password: {
                    minlength: 8,
                    validpassword: true
                },
                birthdayYear: {
                    max: (new Date()).getFullYear() - 18,
                },
                email: {
                    email: true
                },
                repeatEmail: {
                    email: true,
                    equalTo: '#email'
                },
            },
            messages: {
                birthdayYear: {
                    max: "You need to be +18 years old to register"
                }
            },
            errorPlacement: function(error, element) {
                error.appendTo(element.nextAll("span.help-block"));
            },
        },

        render: function() {

            $(this.el).html(registerTpl);

            $('#register-form').validate(this.validation)

        },

        submitRegister: function(e) {
            e.preventDefault(e);
            var data = utils.serializeForm(e.target.id)
            handlersV.submitForm(e.target.id, api.getApiVersion() + '/newuser', data, responseView,
            {
                legend: "Confirm your e-mail address",
                msg: "A confirmation email has been sent to ",
                extraInfo: data.email
            })
        }

    });

    return new registerView;
});
