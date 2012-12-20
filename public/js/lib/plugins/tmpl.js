define(function(require) {

	var text = require('text');
	var view = require('core/view');

	function load(name, parentRequire, done, config) {
		text.load(name, parentRequire, function(template) {
			done(view(template));
		}, config);
	}

	return {
		load: load,
	};
});
