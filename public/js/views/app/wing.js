define(function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var api = require("api2");
    var utils = require("utils");
    var wingTpl = require("tmpl!templates/app/accomodation-form.html");
    var alertTpl = require("tmpl!templates/lib/alert.html");
    var WingModel = require("models/Wing");

    var View = Backbone.View.extend({
        wings: [],
        events: {
            "submit form#accomodation-form": "submitWing",
            "click #update-wing-btn": "updateWing",
            "click #delete-wing-btn": "deleteWing",
            "click #cancel-wing-btn": "close",
            "click input#inputSharingOnce": function(evt) {
                if (evt.target.checked) $("div#sharing-dates").show()
                else {
                    $("div#sharing-dates").hide()
                    $("[name=dateStart]").val("")
                    $("[name=dateEnd]").val("")
                }
            }
        },
        initialize: function(options) {
            this.papa = options.papa
        },
        render: function(options) {
            if (options.target === undefined || options.update === undefined) alert("Bad options" + options.toString())
            var sc = this;

            if (options.id) {
                this.model = new WingModel({
                    id: options.id
                })
                this.model.fetch({
                    success: function(model) {
                        console.log(model.attributes)
                        sc.cityObject = model.get("city")
                        $(sc.el).html( wingTpl({
	                            update: options.update
	                    }))
                        sc.$el.appendTo(options.target)
                        sc.bindModel()
                        sc.initWing()
                    }
                })
            } else {

                $(this.el).html(wingTpl({
                    update: options.update
                }));
                this.$el.appendTo(options.target)
                this.initWing()
            }

        },
        close: function() {
            this.remove()
            this.unbind()
        },
        bindModel: function() {
            this._modelBinder = new Backbone.ModelBinder();
            this._modelBinder.bind(this.model, this.el)
            $("[name=city]").val(this.cityObject.name + ", " + this.cityObject.country)
            if (this.model.get("sharingOnce") === true) $("div#sharing-dates").show()
        },
        initWing: function() {
            var sc = this
            $("input[name=dateStart]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")
            $("input[name=dateEnd]").datepicker().datepicker("option", "dateFormat", "yy-mm-dd")

            require(['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyABBKjubUcAk69Kijktx-s0jcNL1cIjZ98&sensor=false&libraries=places&language=en'],
            function() {
                var autoCity = new google.maps.places.Autocomplete(document.getElementById("inputCity"), {
                    types: ['(cities)']
                });
                google.maps.event.addListener(autoCity, 'place_changed', sc.setAutocomplete(autoCity, "inputCity"));
                $("#inputCity").keypress(function(event) {
                    if (event.which == 13) event.preventDefault()
                })
            })

            $('#accomodation-form').validate()
        },
        setAutocomplete: function(auto, field) {
            var sc = this
            return function() {
                var place = auto.getPlace()
                if (place.geometry) {
                    var cc = utils.getCityAndCountry(place.address_components)
                    cc.lat = place.geometry.location.lat() + ""
                    cc.lon = place.geometry.location.lng() + ""
                    sc.cityObject = cc
                }
            }
        },

        submitWing: function(evt) {
            evt.preventDefault()
            var scope = this
            var data = utils.serializeForm(evt.target.id)
			debugger
            data.city = this.cityObject
            if ((data.dateStart === "" && data.dateEnd === "") && data.sharingOnce == undefined) {
                delete data.dateStart
                delete data.dateEnd
            }
            api.post(api.getApiVersion() + "/profiles/" + api.getProfileId() + "/accomodations/list", data,
            function(response) {
                var tpl
                if (response.status === true) {
                    tpl = _.template(alertTpl, {
                        extraClass: 'alert-success',
                        heading: response.msg
                    })
                    scope.papa.addWingToList({
                        name: data.name,
                        uri: "/profiles/" + api.getUserId() + "/accomodations/" + response.data.id
                    })
                } else tpl = _.template(alertTpl, {
                    extraClass: 'alert-error',
                    heading: response.msg
                })
                $(tpl).prependTo('#main').delay(800).slideUp(300)
            })
        },
        updateWing: function(evt) {
            evt.preventDefault()
            var scope = this
            var id = this.model.get("id")
            //???
            $('#accomodation-form').validate()
            var data = utils.serializeForm("accomodation-form")
            //???
            data.city = this.cityObject
            //???
            if ((data.dateStart === "" && data.dateEnd === "") && data.sharingOnce == undefined) {
                delete data.dateStart
                delete data.dateEnd
            }
            api.put(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + id, data,
            function(response) {
                var tpl
                if (response.status === true) {
                    tpl = _.template(alertTpl, {
                        extraClass: 'alert-success',
                        heading: response.msg
                    })
                    scope.close()
                    $("body").scrollTop()
                    scope.papa.updateWingToList({
                        name: data.name,
                        uri: api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + id
                    })
                } else tpl = _.template(alertTpl, {
                    extraClass: 'alert-error',
                    heading: response.msg
                })
                $(tpl).prependTo('#main').delay(800).fadeOut(300)
            })
        },
        deleteWing: function(evt) {
            var scope = this
            var id = this.model.get("id")
            var uri = api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + id
            if (confirm("Are you sure you want to delete this wing?")) {
                api.delete(uri,
                function(response) {
                    var tpl
                    if (response.status === true) {
                        tpl = _.template(alertTpl, {
                            extraClass: 'alert-success',
                            heading: response.msg
                        })
                        scope.close()
                        $("body").scrollTop()
                        scope.papa.deleteWingFromList(api.getApiVersion() + "/profiles/" + api.getUserId() + "/accomodations/" + id)
                    } else {
                        tpl = _.template(alertTpl, {
                            extraClass: 'alert-error',
                            heading: response.msg
                        })
                    }
                    $(tpl).prependTo('#main').delay(800).fadeOut(300)
                })
            } else {
                return
            }
        },
    });

    return View;
});