var Utils = function(){
	
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var isEmpty = function(obj) {
    	// Assume if it has a length property with a non-zero value
	    // that that property is correct.
	    if (obj.length && obj.length > 0)    return false;
	    if (obj.length && obj.length === 0)  return true;

	    for (var key in obj) {
	        if (hasOwnProperty.call(obj, key))    return false;
	    }

	    return true;
	}
	
	var serialize = function(form_id){
		var form = (form_id) ? 'form#' + form_id : 'form'
		var values = {};
		$.each(jQuery(form).serializeArray(), function(i, field) {
			if (field.value == "") return
			
			var aux = [];
			var old = values[field.name];
    		if (old) {
				if (old instanceof Array)
					values[field.name].push(field.value)
				else {
					aux.push(old, field.value)
					values[field.name] = aux
				}
			}
			else
				values[field.name] = field.value;
		});
		return values
	}
	
	var opts = {
  		  lines: 13, // The number of lines to draw
		  length: 7, // The length of each line
		  width: 4, // The line thickness
		  radius: 10, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  color: '#000', // #rgb or #rrggbb
		  speed: 1, // Rounds per second
		  trail: 60, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: 'auto', // Top position relative to parent in px
		  left: 'auto' // Left position relative to parent in px
	}

	return {
		serializeForm: serialize,
		objectIsEmpty: isEmpty,
		getSpinOpts: function(){
			return opts;
		},
	}
	
}();
