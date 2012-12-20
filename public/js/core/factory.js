define(function(require) {

	return function Factory(model) {
		var store = {};

		function ModelFactory(attr, opt) {
			var idField = this.idAttribute;

			if (!attr || !(idField in attr))
				throw new Error('Cool Models always have IDs!');

			var id = attr[idField];

			if (!store.hasOwnProperty(id))
				store[id].set(attr, opt);
			else {
				model.call(this, attr, opt);
				store[id] = this;
			}

			return store[id];
		}

		ModelFactory.prototype = Object.create(model.prototype);
		return ModelFactory;
	}
});
