/*globals Blitline */

define(function(require) {

	var blitline = new Blitline();
	var queue = [];
	var inProgress = false;

	function submit(job, onComplete) {
		queue.push({
			data: job,
			callback: onComplete
		});

		next();
	}

	function next() {
		if (inProgress || !queue.length)
			return;

		inProgress = true;
		var task = queue.shift();

		blitline.submit(task.data, {
			completed : function(images, error) {
				inProgress = false;
				next();

				if (task.callback)
					task.callback.call(this, images, error);
			},
		});
	}

	function isProcessing() {
		return inProgress;
	}

	return {
		submit: submit,
		isProcessing: isProcessing
	};
});
