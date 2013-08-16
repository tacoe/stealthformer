(function(){
"use strict";

function TiledImage(image, gridSize) {
	this.image = image;
	this.grid = gridSize;	// each image tile is grid x grid pixels

	var sw = image.width, sh = image.height,
		tw = Math.ceil(sw / this.grid), th = Math.ceil(sh / this.grid);

	this.leftTopForIndex = function(tileIndex) {
		return [this.grid * (tileIndex)];
	};
}


function Sprite() {
	this.spriteSheet = null;
}


window.Actors = {};


	
}());