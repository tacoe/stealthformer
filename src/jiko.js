(function(){
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel


function LevelData() {
	this.map = null;
	this.texture = null;
}


function loadLevel(fileURL) {
	var data = new LevelData();

	return Jiko.Map.loadTileMap(fileURL)
		.then(function(tm) {
			Jiko.log(tm);
			data.map = tm;
			return data;
		});
}


function MapView(levelData) {
	var map = levelData.map,
		tex = levelData.texture,
		gridSize = tex.grid;

	function renderTileLayer(ctx, tl) {
		var x, y, row, tile;

		for (y=0; y < tl.height; ++y) {
			row = tl[y];

			for (x=0; x < tl.width; ++x) {
				tile = row[x];
				if (tile && tile.ix >= 0) {
					var txy = tile.flipX ? tex.tileXY[tile.ix + tex.horizFlipOffset] : tex.tileXY[tile.ix];
					ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, x * gridSize, y * gridSize, gridSize, gridSize);
				}
			}
		}
	}

	this.render = function(ctx) {
		renderTileLayer(ctx, map.layers["BG Static"]);
		renderTileLayer(ctx, map.layers["BG Building"]);
		renderTileLayer(ctx, map.layers["Actors"]);
		renderTileLayer(ctx, map.layers["BG Props"]);
		renderTileLayer(ctx, map.layers["FG Props"]);
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


window.onload = function() {
	var level, texture, stuff;

	stuff = [
		View.init(),
		Jiko.Image.loadTiledTexture("gfx/jiko-tiles.png", 16).then(function(tex){ texture = tex; }),
		loadLevel("levels/test1.xml").then(function(ld){ level = ld; })
	];

	Q.all(stuff).then(function(){
		level.texture = texture;
		new MapView(level).render(View.ctx());
	});
};

}());
