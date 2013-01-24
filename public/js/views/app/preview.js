define(function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var api = require("api2");
    var PreviewModel = require("models/ProfilePreview")
    var mapView = require('views/app/map');
    var previewTpl = require('tmpl!templates/app/preview.html');

    var previewView = Backbone.View.extend({

        el: "#main",

        initialize: function() {

            this.getWingList()
            this.model = new PreviewModel({
                _id: "preview"
            })
            this.map = new mapView({
                el: "#user-map",
                id: "mapcanvas"
            })
            this.model.on("change", this.render.bind(this));
            this.model.fetch()

        },
        render: function() {
            var cs = {
                civilState: {
                    SI: "Single",
                    EN: "Engaged",
                    MA: "Married",
                    WI: "Widowed",
                    IR: "In a relationship",
                    IO: "In an open relationship",
                    IC: "It's complicated",
                    DI: "Divorced",
                    SE: "Separated"
                } [this.model.get("civilState")]
            }

            var data = _.extend(this.model.toJSON(), {
                wings: this.wingsList
            },
            cs)

            $(this.el).html(previewTpl(data))

            this.map.render()
            this.initMarkers()
        },

        initMarkers: function() {
            var sc = this

            var city = this.model.get("current")
            this.map.addMarker("current", new google.maps.LatLng(city.lat, city.lon), city.name + ", " + city.country)

            city = this.model.get("hometown")
            this.map.addMarker("hometown", new google.maps.LatLng(city.lat, city.lon), city.name + ", " + city.country)

            var others = this.model.get("otherLocations")
            _.each(others,
            function(location, index) {
                sc.map.addMarker("otherLocation-" + index, new google.maps.LatLng(location.lat, location.lon), location.name + ", " + location.country)
            })

            this.map.renderMarkers()
        },

        getWingList: function() {
            var sc = this
            api.get(api.getApiVersion() + "/profiles/" + api.getProfileId() + "/accomodations/preview", {})
            .prop("data")
            .then(function(data) {
                sc.wingsList = data.map(function(wing) {
                    return _.extend(wing, {
                        smoking: {
                            S: "I smoke",
                            D: "I don't smoke, but guests can smoke here",
                            N: "No smoking allowed"
                        } [wing.smoking]
                    },
                    {
                        whereSleepingType: {
                            C: "Common area",
                            P: "Private area",
                            S: "Shared private area"

                        } [wing.whereSleepingType]
                    },
                    {
                        status: {
                            Y: "Yes",
                            N: "No",
                            M: "Maybe"
                        } [wing.status]
                    }
                    )
                })
            })
            .fin(function() {
                sc.render()
            })
        }

    });

    return new previewView;
});