define(function(require) {

	var text = require('text');
	var Handlebars = require('handlebars');
	var cache = [];

	function createEnum(values) {
		if (values instanceof Array)
			values = _.object(_.values(values), _.keys(values));

		values.fromValue = function(value) {
			var result;
			_.each(this, function(id, key) { if (id === value) result = key });
			return result;
		};

		return values;
	}

	var enums = {
		'notification-type': createEnum({
			Request: 'requests',
			Invitation: 'invites',
			Message: 'messages'
		})
	};

	Handlebars.registerHelper('date', function(value, format) {
		var date = typeof value === 'number' ? moment.unix(value) : moment(value);

		if (format === 'from now')
			return date.fromNow();

		return date.format(typeof format === 'string' ? format : 'L')
	});

	Handlebars.registerHelper('enum', function(value, id) {
		return enums[id].fromValue(value);
	});

	function load(name, parentRequire, done, config) {
		text.load(name, parentRequire, function(template) {
			done(Handlebars.compile(template));
		}, config);
	}

	return {
		load: load,
	};
});
