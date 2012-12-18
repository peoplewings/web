define(function(require) {

    var text = require('text');
    var Handlebars = require('handlebars');
    var cache = [];

    Handlebars.registerHelper('date', function(date) {
        if (typeof date === 'number')
            date = new Date(date * 1000);

        return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
    })

    function load(name, parentRequire, done, config) {
        if (config.tmpl)
            var file = ((config.tmpl.path + '/') || '') + name + (config.tmpl.extension || '');
        else
            var file = name;
        text.load(file, parentRequire, function(template) {
            done(cache[name] = Handlebars.compile(template));
        }, config);
    }

    return {
        load: load,
    };
});
