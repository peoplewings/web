define(function(require) {

	var api = require('api');

	describe('API helper', function() {
		describe('#get method', function() {

			var server;

			before(function () { server = sinon.fakeServer.create(); });
			after(function () { server.restore(); });
			
			it('should call the success callback', function() {
				server.respondWith([200, { "Content-Type": "application/json" }, '[{ "status": true, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.get("/", {}, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
			it('should call the error callback', function() {
				server.respondWith([400, { "Content-Type": "application/json" }, '[{ "status": false, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.get("/", {}, null, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
		});
		describe('#post method', function() {

			var server;

			before(function () { server = sinon.fakeServer.create(); });
			after(function () { server.restore(); });
			
			it('should call the success callback', function() {
				server.respondWith([200, { "Content-Type": "application/json" }, '[{ "status": true, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.post("/", {}, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
			it('should call the error callback', function() {
				server.respondWith([400, { "Content-Type": "application/json" }, '[{ "status": false, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.post("/", {}, null, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
		});
		describe('#put method', function() {

			var server;

			before(function () { server = sinon.fakeServer.create(); });
			after(function () { server.restore(); });
			
			it('should call the success callback', function() {
				server.respondWith([200, { "Content-Type": "application/json" }, '[{ "status": true, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.put("/", {}, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
			it('should call the error callback', function() {
				server.respondWith([400, { "Content-Type": "application/json" }, '[{ "status": false, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.put("/", {}, null, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
		});
		describe('#delete method', function() {

			var server;

			before(function () { server = sinon.fakeServer.create(); });
			after(function () { server.restore(); });
			
			it('should call the success callback', function() {
				server.respondWith([200, { "Content-Type": "application/json" }, '[{ "status": true, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.delete("/", callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
			it('should call the error callback', function() {
				server.respondWith([400, { "Content-Type": "application/json" }, '[{ "status": false, "data": "Some data" }]'])
				var callback = sinon.spy();
				api.delete("/", null, callback)
				server.respond()
				expect(callback.calledOnce).toBeTrue()
			});
		});
	});
});
