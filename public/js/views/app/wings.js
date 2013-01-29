define(function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var api = require("api2");
    var utils = require("utils");
    var wingsTpl = require("tmpl!templates/app/wings.html");
    var alertTpl = require("tmpl!templates/lib/alert.html");
    var ProfileModel = require("models/Profile");
    var WingModel = require("models/Wing");

    var spinner = new Spinner(utils.getSpinOpts());

    var wingsView = Backbone.View.extend({

        el: "#main",

        events: {
            "click #add-wing-btn": "createWing",
            "change [name=generalStatus]": "changeStatus",
            "change #wings-list": "updateWing",
        },

        initialize: function() {
            this.model = new ProfileModel({
                id: api.getProfileId()
            })
            this.model.on("change", this.render.bind(this))

            if (!this.model.get("pwState"))
            this.model.fetch()

            this.wingsList = new Backbone.Collection();

            this.getUserWings()
        },
        render: function(url) {

            $(this.el).html(wingsTpl({
                wings: this.wingsList.toJSON()
            },
            {
                generalStatus: this.model.get("pwState")
            }));

        },

        getUserWings: function() {
            var sc = this
            api.get(api.getApiVersion() + "/profiles/" + api.getProfileId() + "/accomodations/list", {})
            .prop('data')
            .then(function(data) {
                sc.wingsList.add(data)
            })
            .fin(function() {
                sc.render()
            })
        },

        addWingToList: function(wing) {
            this.wings.push(wing)
            this.render()
        },
        updateWingToList: function(item) {
            //Should only be invoked if Wing name is dirty
            var updated = _.find(this.wings,
            function(wing) {
                return wing.uri == item.uri
            })
            updated.name = item.name
            this.render()
        },
        deleteWingFromList: function(uri) {
            this.wings = _.reject(this.wings,
            function(wing) {
                return wing.uri == uri
            })
            this.render()

        },
        createWing: function() {
            //Refactor with changeWing!!
            var scope = this
            if (!this.wingView) {
                require(["views/app/wing"],
                function(wingView) {
                    scope.wingView = new wingView({
                        papa: scope
                    })
                    scope.wingView.render({
                        target: "#my-wings",
                        update: false
                    })
                })
            } else {
                this.wingView.close()
                require(["views/app/wing"],
                function(wingView) {
                    scope.wingView = new wingView({
                        papa: scope
                    })
                    scope.wingView.render({
                        target: "#my-wings",
                        update: false
                    })
                })

            }
        },
        changeStatus: function(e) {
            var sc = this
            spinner.spin(document.getElementById('main'));
            api.put(api.getApiVersion() + "/profiles/" + api.getProfileId(), {
                pwState: e.target.value
            })
            .prop('msg')
            .then(function(msg) {
                spinner.stop();
                return msg;
            })
            .fin(function(msg) {
                sc.$el.prepend(alertTpl({
                    extraClass: 'alert-success',
                    heading: msg
                }));
            })
        },

        updateWing: function(e) {
            console.log(this.wings)
            //Refactor with createWing
            var scope = this
            //console.log(e.target.value)
            if (e.target.value) {
                var id = e.target.value.split("accomodations/", 2)[1]
                if (!this.wingView) {
                    require(["views/app/wing"],
                    function(wingView) {
                        scope.wingView = new wingView({
                            papa: scope
                        })
                        scope.wingView.render({
                            target: "#my-wings",
                            update: true,
                            id: id
                        })
                    })
                } else {
                    this.wingView.close()
                    require(["views/app/wing"],
                    function(wingView) {
                        scope.wingView = new wingView({
                            papa: scope
                        })
                        scope.wingView.render({
                            target: "#my-wings",
                            update: true,
                            id: id
                        })
                    })

                }
            }
        }
    });

    return new wingsView;
});