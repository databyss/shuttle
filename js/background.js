// background class from canvasbg project http://www.github.com/databyss/canvasbg
function Background() {
	"use strict";
	this.image = null;
	this.scale = 1;
	this.scroll = {
		x: 0,
		y: 0
	};
	this.scrollFactor = {
		x: 1,
		y: 1
	};
	this.velocity = {
		x: 0,
		y: 0
	};
}

// returns the drawn width of image
Background.prototype.gameWidth = function () {
	if (this.image === null) {
		return 0;
	}
	return (this.image.width * this.scale);
};

// returns the drawn height of image
Background.prototype.gameHeight = function () {
	if (this.image === null) {
		return 0;
	}
	return (this.image.height * this.scale);
};

// updates the positon based on velocity
Background.prototype.update = function (ms) {
	this.scroll.x += this.velocity.x * (ms / 1000);
	this.scroll.y += this.velocity.y * (ms / 1000);
	if (this.scroll.x > this.gameWidth()) {
		this.scroll.x = 0;
	}
	if (this.scroll.x < 0) {
		this.scroll.x = this.gameWidth() - 1;
	}
	if (this.scroll.y > this.gameHeight()) {
		this.scroll.y = 0;
	}
	if (this.scroll.y < 0) {
		this.scroll.y = this.gameHeight() - 1;
	}
};

// render the background to the canvas
Background.prototype.draw = function (c, ctx, gameWorld, clearScreen) {
	var xPoint, yPoint;
	if (clearScreen) {
		ctx.clearRect(0, 0, c.width, c.height);
	}
	if (this.image !== null) {
		xPoint = this.scroll.x - ((gameWorld.xOffset * this.scrollFactor.x) % this.gameWidth()) - (this.gameWidth() * 2); // replace by scroll and scrollFactor
		yPoint = this.scroll.y - ((gameWorld.yOffset * this.scrollFactor.y) % this.gameHeight()) - (this.gameHeight() * 2);

		while (xPoint < c.width) {
			while (yPoint < c.height) {
				//TODO: if image is too big, only draw to edge of canvas
				ctx.drawImage(this.image, xPoint, yPoint, this.gameWidth(), this.gameHeight());
				yPoint += this.gameHeight();
			}
			yPoint = this.scroll.y - ((gameWorld.yOffset * this.scrollFactor.y) % this.gameHeight()) - (this.gameHeight() * 2);
			xPoint += this.gameWidth();
		}
	}
};

// END background class