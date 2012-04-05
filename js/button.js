function Button(c, ctx) {
	this.c = c;
	this.ctx = ctx;
	this.image = null;
	this.width = 0;
	this.height = 0;
	this.drawWidth = 34;
	this.drawHeight = 50;
	this.alpha = 0.25; // 25%
	this.pos = {
		x: 0,
		y: 0
	};
};

Button.prototype.setImage = function (img) {
	this.image = img;
	this.width = img.width;
	this.height = img.height;
	this.pos = { x: 50, y: 50};
	this.drawWidth = 64;
	this.drawHeight = 64;
};

Button.prototype.isInside = function(point) {
	if (point.x >= this.pos.x && this.point.x <= (this.pos.x + this.drawWidth) && point.y >= this.pos.y && this.point.y <= (this.pos.y + this.drawHeight)) {
		return true;
	} else {
		return false;
	}
}

Button.prototype.draw = function () {
	"use strict";
	// draw player
	//ctx.fillStyle = this.color;
	//ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
	if (this.image !== null) {
		this.ctx.save();
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(this.image, this.pos.x, this.pos.y, this.drawWidth, this.drawHeight);
		this.ctx.restore();
	}
};