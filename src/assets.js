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


function TextFile(data) {
	function line() {
		if (! data)
			return null;

		var endl = data.indexOf("\n");
		if (endl < 0)
			endl = data.length;

		var ln = data.slice(0, endl);
		data = data.slice(endl + 1);
		return ln;
	}

	return { perLine: function(fn) {
		for (var l = line(); l != null; l = line()) {
			fn(l);			
		}
	}};
}


function TileMap() {
	this.width = this.height = 0;
	this.layers = [];

	this.numLayers = function() { return this.layers.length; };
	this.rowOfLayer = function(row, layer) { return this.layers[layer][row]; };
	this.tileInLayer = function(col, row, layer) { return this.rowOfLayer(row, layer)[col]; };
}


function pyxelTileMap(data) {
	var tileMap = new TileMap(),
		layer;

	TextFile(data)
	.perLine(function(ln) {
		var toks;
		if (layer) {
			if (! ln) {
				layer = null;
				return;
			}
			toks = ln.replace(/^,|,$/g, '').split(",");

			// each line is an array of ints
			layer.push(toks.map(function(t) {
				return parseInt(t);
			}));
		}
		else {
			if (! ln) return;

			toks = ln.split(" ");
			if (toks[0] == "tileswide")
				tileMap.width = parseInt(toks[1]);
			else if (toks[0] == "tileshigh")
				tileMap.height = parseInt(toks[1]);
			else if (toks[0] == "layer")
				layer = tileMap.layers[parseInt(toks[1])] = [];
			else
				console.info("ignored directive ", toks[0]);
		}
	});

	return tileMap;
}


function loadTileMap(url) {
	return Assets.load({url:url})
	.then(function(xhr) {
		return pyxelTileMap(xhr.responseText);
	});
}


function loadImage(url) {
	var d = Q.defer(),
		image = new Image();
	
	image.onload = function() { d.resolve(image); };
	image.onerror = function() { d.reject("The texture `" + url + "` could not be loaded."); };

	image.src = url;
	return d.promise;
};


function TextureSet(data) {
	var self = data;
	return self;
}

function loadTextureSet(urls) {
	function name(url) {
		var slash = url.lastIndexOf('/'),
			dot = url.lastIndexOf('.');

		if (dot < 0) dot = url.length;
		return url.substring(slash + 1, dot);
	}

	var tset = {};

	return Q.all(urls.map(
		function(u) {
			return loadImage(u)
			.then(function(img) {
				tset[name(u)] = img;
			});
		}
	))
	.then(function() {
		return TextureSet(tset);
	});
}


Assets.TileMap = TileMap;
Assets.TextFile = TextFile;
Assets.TextureSet = TextureSet;

Assets.loadTileMap = loadTileMap;
Assets.loadTextureSet = loadTextureSet;
Assets.loadImage = loadImage;


}());
