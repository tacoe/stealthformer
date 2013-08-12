(function(){
"use strict";


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


function TileMap(data) {
	var width_, height_,
		layers_ = [];
	
	var layer;

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
				width_ = parseInt(toks[1]);
			else if (toks[0] == "tileshigh")
				height_ = parseInt(toks[1]);
			else if (toks[0] == "layer")
				layer = layers_[parseInt(toks[1])] = [];
			else
				console.info("ignored directive ", toks[0]);
		}
	});

	this.width = function() { return width_; };
	this.height = function() { return height_; };
	this.numLayers = function() { return layers_.length; };

	this.rowOfLayer = function(row, layer) { return layers_[layer][row]; };
	this.tileInLayer = function(col, row, layer) { return this.rowOfLayer(row, layer)[col]; };
}


function loadTileMap(url) {
	return Assets.load({url:url})
	.then(function(xhr) {
		return new TileMap(xhr.responseText);
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


function Level() {
	var tiles_,
		tp = loadTileMap("levels/proto.txt")
		.then(function(tm) { tiles_ = tm; }),
		tex_,
		xp = loadTextureSet(["gfx/scowltiles.png"])
		.then(function(txs) { tex_ = txs; });

	this.render = function(ctx) {
		var layerCount = tiles_.numLayers(),
			height = tiles_.height(),
			width = tiles_.width(),
			tex = tex_["scowltiles"];

		var x, y, l, row, tix, tx, ty;
		for (l=0; l<layerCount; ++l) {
			for (y=0; y<height; ++y) {
				row = tiles_.rowOfLayer(y, l);
				for (x=0; x<width; ++x) {
					tix = row[x];
					if (tix > -1) {
						tx = (tix & 7) * 16;
						ty = (tix & ~7) * 2;
						ctx.drawImage(tex, tx, ty, 16, 16, x * 16, y * 16, 16, 16);
					}
				}
			}
		}
	};

	var self = this;
	return Q.all([tp, xp]).then(function(){return self;});
}



var View = (new function() {
	var canvas_,
		ctx_;

	this.init = function() {
		canvas_ = document.querySelector("canvas");
		ctx_ = canvas_.getContext("2d");
		ctx_.webkitImageSmoothingEnabled = false;
		ctx_.mozImageSmoothingEnabled = false;
		ctx_.imageSmoothingEnabled = false;
		// ctx_.scale(3.0, 3.0);

		return Q.defer().resolve();
	};

	this.ctx = function() { return ctx_; };
}());


window.main = function() {
	var lvl, systems = [View.init(), (new Level()).then(function(one){lvl=one})];

	Q.all(systems).then(function(){
		lvl.render(View.ctx());
	});
};

}());
