(function(){
"use strict";

window.Assets = {};

Assets.load = function(opts) {
	var xhr = new XMLHttpRequest(),
		response = Q.defer();

	function fail() {
		console.info("ASSETS FAIL");
		response.reject.apply(response, arguments);
	}

	function load() {
		if (xhr.status == 200 || (xhr.status === 0 && xhr.response))
			response.resolve(xhr);
		else
			fail("Failed to load asset with options", opts);
	}

	try {
		xhr.open("GET", opts.url, true);
		if (opts.configRequest)
			opts.configRequest(xhr);
		xhr.onload = load;
		xhr.onerror = fail;
	} catch (e) {
		fail(e.message, e);
	}

	xhr.send();
	return response.promise;
};

}());
