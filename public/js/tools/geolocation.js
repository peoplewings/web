define(function(require) {

	var _ = require('underscore');
	var Promise = require('promise');


	function getCityFromGcoder(results) {
		return results.reduce(function(result, item) {
			if (result) return result;
			if (item.types.join(',') === 'locality,political')
				return item.formatted_address;
		}, null);
	}

	var geocoder = new google.maps.Geocoder();

	var getCityFromCoords = _.memoize(function(coords) {
		var prom = new Promise();

		var latLng = new google.maps.LatLng(coords.latitude, coords.longitude);
		geocoder.geocode({ latLng: latLng }, function(results, status) {
			if (status != google.maps.GeocoderStatus.OK)
				return prom.reject(status);
			prom.resolve(getCityFromGcoder(results));
		});

		return prom.future;
	});


	var getLocation = _.memoize(function getLocation() {
		if (!navigator.geolocation)
			return Promise.rejected('Not supported');

		var prom = new Promise();

		navigator.geolocation.getCurrentPosition(function(location) {
			prom.resolve(location.coords);
		}, function(error) {
			prom.reject(error.code === 1 ? 'User rejected permission' : null);
		});

		return prom.future;
	});


	function getCurrentCity() {
		return getLocation().then(getCityFromCoords);
	}

	return {
		getCurrentLocation: getLocation,
		getCityFromCoords: getCityFromCoords,
		getCurrentCity: getCurrentCity,
	};
});
