function Level(c, ctx) {
	"use strict";
	this.c = c;
	this.ctx = ctx;
	this.level_map = null;
	this.map_data = null;
	this.xOffset = 0;
	this.yOffset = 0;
	this.scale = 40;
	this.scaleMinusOne = 39;
	this.gravity = 7;
	this.specialBlocks = {
		blank: '#000000',
		end: '#ff0000',
		start: '#00ff00'
	};

}

Level.prototype.mapWidth = function () {
	var returnValue = null;
	if (this.level_map !== null) {
		returnValue = this.level_map.width * this.scale;
	}
	return returnValue;
};

Level.prototype.mapHeight = function () {
	var returnValue = null;
	if (this.level_map !== null) {
		returnValue = this.level_map.height * this.scale;
	}
	return returnValue;
};

Level.prototype.colorAt = function (x, y) {
	var output, start;
	output = '#000000';
	if (this.map_data !== null) {
		if (x >= 0 && y >= 0 && x < this.level_map.width && y < this.level_map.height) {
			start = (y * this.level_map.width * 4) + (x * 4); // 4 elements per pixel RGBA
			try {
				output = '#';
				//(this.map_data[first]).toString(16) + (this.map_data[first + 1]).toString(16) + (this.map_data[first + 2]).toString(16);
				if ((this.map_data[start]).toString(16).length < 2) {
					output += '0' + (this.map_data[start]).toString(16);
				} else {
					output += (this.map_data[start]).toString(16);
				}
				start += 1;
				if ((this.map_data[start]).toString(16).length < 2) {
					output += '0' + (this.map_data[start]).toString(16);
				} else {
					output += (this.map_data[start]).toString(16);
				}
				start += 1;
				if ((this.map_data[start]).toString(16).length < 2) {
					output += '0' + (this.map_data[start]).toString(16);
				} else {
					output += (this.map_data[start]).toString(16);
				}
			} catch (e) {
				console.log('Error getting map_data for (' + x + ', ' + y + ')');
			}
			return output;
		}
	}
	return output;
};

Level.prototype.getStart = function () {
	var x, y;
	for (x = 0; x < this.level_map.width; x += 1) {
		for (y = 0; y < this.level_map.height; y += 1) {
			if (this.colorAt(x, y) === this.specialBlocks.start) {
				return ({x: x, y: y});
			}
		}
	}
	return ({x: 0, y: 0});
};

Level.prototype.getEnd = function () {
	var x, y;
	for (x = 0; x < this.level_map.width; x += 1) {
		for (y = 0; y < this.level_map.height; y += 1) {
			if (this.colorAt(x, y) === this.specialBlocks.end) {
				return ({x: x, y: y});
			}
		}
	}
	return ({x: 0, y: 0});
};

Level.prototype.draw = function () {
	var blockCount, xDraw, yDraw, x, y, thisColor;
	blockCount = 0;
	if (this.map_data !== null) {
		// precalculate max x value in map array
		xDraw = Math.floor(this.xOffset / this.scale) + Math.floor(this.c.width / this.scale) + 1;
		yDraw = Math.floor(this.yOffset / this.scale) + Math.floor(this.c.height / this.scale) + 1;
		for (y = Math.floor(this.yOffset / this.scale); y < this.level_map.height; y += 1) {
			for (x = Math.floor(this.xOffset / this.scale); x < xDraw; x += 1) {
				thisColor = this.colorAt(x, y);
				if (thisColor !== this.specialBlocks.blank) { // don't draw blank tiles
					// only draw if near canvas
					if ((x * this.scale) - this.xOffset >= -this.scale && (x * this.scale) - this.xOffset <= this.c.width) {
						if ((y * this.scale) - this.yOffset >= -this.scale && (y * this.scale) - this.yOffset <= this.c.height) {
							//TODO add bounds checking for yOffset too
							this.ctx.fillStyle = thisColor;
							this.ctx.fillRect((x * this.scale) - this.xOffset, (y * this.scale) - this.yOffset, this.scale, this.scale);
							blockCount += 1;
						}
					}
				}
			}
		}
	}
};

Level.prototype.toMapCoord = function (point) {
	var p = {
		x: point.x,
		y: point.y
	};

	p.x = Math.floor((p.x + this.xOffset) / this.scale); // map is full length, so get that
	p.y = Math.floor((p.y + this.yOffset) / this.scale);

	// check in bounds
	if (p.x < 0 || p.x > this.level_map.width || p.y < 0 || p.y > this.level_map.height) {
		p = null;
	}

	return p;
};