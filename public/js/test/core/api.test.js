define(function(require) {

	var api = require('api');

	describe('API helper', function() {
		it('should pass', function() {
			expect(1).toBe(1);
		});
		it('should fail', function() {
			expect(1).toBe(2);
		});
	});
});
