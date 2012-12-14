define(function(require) {

	var api = require('api');

	describe('API helper', function() {
		it('should pass', function() {
			expect(1).toBe(1);
			//var server = sinon.fakeServer();
			//api.get('/', spy1, spy2)
			//expect(spy1.calledOnce).toBeTrue()
		});
		it('should fail', function() {
			expect(1).toBe(2);
		});
	});
});
