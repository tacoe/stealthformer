 (function(){
"use strict";

/*
- animation
	[] frame index + duration + frame offset
- 1 tile = 1m x 1m
- 
*/

function LevelData() {
	this.map = null;
	this.textures = null;
}

function fileLevel(fileURL, texURLs) {
	var data = new LevelData(),
		tp = Assets.loadTileMap(fileURL)
		.then(function(tm) { data.map = tm; }),
		tex_,
		xp = Assets.loadTextureSet(texURLs)
		.then(function(txs) { data.textures = txs; });

	return Q.all([tp, xp])
	.then(function(){ return data; });
}


function genLevel(w, h, texURLs) {
	var data = new LevelData(),
		xp = Assets.loadTextureSet(texURLs)
		.then(function(txs) { data.textures = txs; });

	var map = data.map = new Assets.TileMap();
	map.width = w;
	map.height = h;

	function fill(arr, num, val) { while(--num > -1) arr[num] = val; return arr; }

	function makeLayer(w, h) {
		var layer = [], row;
		for (var n=0; n<h; ++n)
			layer.push(fill([], w, -1));
		return layer;
	}

	// bg0 (empty)
	map.layers.push(makeLayer(w, h));
	
	// bg1 (just a floor)
	var bg1 = makeLayer(w, h);
	fill(bg1[bg1.length-1], w, 33);

	// collission (mirror bg1)
	var collission = bg1.slice(0);

	map.layers.push(bg1, collission);

	return xp.then(function() { return data; });
}


function MapView(levelData) {
	var map = levelData.map,
		texSet = levelData.textures;

	this.render = function(ctx) {
		var layerCount = map.numLayers(),
			height = map.height,
			width = map.width,
			tex = texSet["jiko-tiles"];

		var x, y, l, row, tix, tx, ty;
		for (l=0; l<layerCount; ++l) {
			for (y=0; y<height; ++y) {
				row = map.rowOfLayer(y, l);
				for (x=0; x<width; ++x) {
					tix = row[x];
					if (tix > -1) {
						tx = (tix & 15) * 16;
						ty = (tix & ~15);
						ctx.drawImage(tex, tx, ty, 16, 16, x * 16, y * 16, 16, 16);
					}
				}
			}
		}
	};
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
		ctx_.scale(3.0, 3.0);

		return Q.defer().resolve();
	};

	this.ctx = function() { return ctx_; };
}());


window.main = function() {
	var lvl,
		stuff = [
			View.init(),
			fileLevel("levels/test1.xml", ["gfx/jiko-tiles.png"]).then(function(ld){ lvl = ld; })
			// genLevel(20, 6, ["gfx/scowltiles.png"]).then(function(ld){ lvl = ld; })
		];

	Q.all(stuff).then(function(){
		new MapView(lvl).render(View.ctx());
	});
};

}());
