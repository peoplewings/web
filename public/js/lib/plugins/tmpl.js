define(function(require) {

	var text = require('text');
	var view = require('core/view');

	var cache = {};

	function load(name, parentRequire, done, config) {
		text.load(name, parentRequire, function(template) {
			cache[name] = template;
			done(view(template));
		}, config);
	}

	function write(pluginName, moduleName, write, config) {
		write.asModule(pluginName + "!" + moduleName, [
			"define([ 'core/view' ], function(view) {",
				"return view('",
					text.jsEscape(cache[moduleName]),
				"');",
			"});"
		].join(""));
	}

	return {
		load: load,
		write: write,
	};
});
