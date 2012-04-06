function Button(c, ctx, id) {
	this.id = id;
	this.c = c;
	this.ctx = ctx;
	this.image = null;
	this.width = 0;
	this.height = 0;
	this.scale = 1;
	this.drawWidth = 64;
	this.drawHeight = 64;
	this.alpha = 0.25; // 25%
	this.isDown = false;
	this.pos = {
		x: 0,
		y: 0
	};
};

Button.prototype.touch = function() {
	if (!this.isDown) {
		this.isDown = true;
	}
}

Button.prototype.untouch = function() {
	if(this.isDown) {
		this.isDown = false;
	}
}

Button.prototype.setPosition = function(point) {
	this.pos = point;
}

Button.prototype.setScale = function(scale) {
	this.scale = scale;
	this.drawWidth = this.width * this.scale;
	this.drawHeight = this.height * this.scale
}

Button.prototype.setImage = function (img) {
	this.image = img;
	this.width = img.width;
	this.height = img.height;
	this.pos = { x: 0, y: 0 };
	this.drawWidth = this.width * this.scale;
	this.drawHeight = this.height * this.scale
};

Button.prototype.isInside = function(point) {
	if (point.x >= this.pos.x && point.x <= (this.pos.x + this.drawWidth) && point.y >= this.pos.y && point.y <= (this.pos.y + this.drawHeight)) {
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