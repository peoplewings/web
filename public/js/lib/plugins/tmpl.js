define(function(require) {

	var text = require('text');
	var Handlebars = require('handlebars');
	var cache = [];

	Handlebars.registerHelper('date', function(value, format) {
		var date = typeof value === 'number' ? moment.unix(value) : moment(value);
		return date.format(typeof format === 'string' ? format : 'L')
	});

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
