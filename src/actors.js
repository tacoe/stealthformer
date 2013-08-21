(function(){
"use strict";

function GridImage(image, gridSize) {
	this.image = image;
	this.grid = gridSize;	// each image tile is grid x grid pixels

	var sw = image.width, sh = image.height,
		tw = Math.ceil(sw / this.grid), th = Math.ceil(sh / this.grid);

	this.leftTopForIndex = function(tileIndex) {
		return [this.grid * (tileIndex)];
	};
}


function Sprite(image) {
	this.gridImage = new GridImage(image, 16);

}


function defineActor() {
}


defineSprite(
	"jiko",	// <-- name of actor
	"jiko-tiles", // <-- name of grid image (texture) to use
	[{ // sequences
		name: "walk-left",
		frames: [
			{ tile: 1, offset: [0,0], time: 100 },  // offset in pixels rel from actor pos, time in ms
			{ tile: 2, offset: [0,0], time: 100 },
			{ tile: 3, offset: [0,0], time: 100 },
			{ tile: 4, offset: [0,0], time: 100 }
		]
	}]
)

	
}());