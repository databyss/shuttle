require(['level']);

function Player (c, ctx) {
	"use strict";
	this.c = c;
	this.ctx = ctx;
	this.width = 0;
	this.height = 0;
	this.drawWidth = 34;
	this.drawHeight = 50;
	this.pos = { // player position
		x: 512,
		y: 550
	};
	this.vel = { // player velocity
		x: 0,
		y: 0
	};
	this.maxVel = {
		x: 20,
		y: 20
	};
	this.color = '#ffffff';
	this.thrust = 12;
	this.sideThrust = 12;
	this.gravity = 12;
	this.image = null;
	this.frames = 5;
	this.fps = 20;
	this.currentFrame = 0;
	this.timeCounter = 0;
	this.corners = {
		topLeft: {
			x: null,
			y: null
		},
		topRight: {
			x: null,
			y: null
		},
		botLeft: {
			x: null,
			y: null
		},
		botRight: {
			x: null,
			y: null
		},
		mapTopLeft: {
			x: null,
			y: null
		},
		mapTopRight: {
			x: null,
			y: null
		},
		mapBotLeft: {
			x: null,
			y: null
		},
		mapBotRight: {
			x: null,
			y: null
		},
		fill: function (point, object, level) {
			"use strict";
			this.topLeft.x = point.x;
			this.topLeft.y = point.y + object.drawHeight;
	
			this.topRight.x = point.x + object.drawWidth;
			this.topRight.y = point.y + object.drawHeight;
	
			this.botLeft.x = point.x;
			this.botLeft.y = point.y;
	
			this.botRight.x = point.x + object.drawWidth;
			this.botRight.y = point.y;
	
			this.mapTopLeft = level.toMapCoord(this.topLeft);
			this.mapTopRight = level.toMapCoord(this.topRight);
			this.mapBotLeft = level.toMapCoord(this.botLeft);
			this.mapBotRight = level.toMapCoord(this.botRight);
		}
	};
};

Player.prototype.nextFrame = function (ms) {
	"use strict";
	this.timeCounter += ms;
	if (this.timeCounter > (1000 / this.fps)) {
		this.currentFrame += 1;
		this.timeCounter = 0;
	}
	if (this.currentFrame >= this.frames) {
		this.currentFrame = 0;
	}
};

Player.prototype.update = function (ms, level, input, engine) {
	"use strict";
	var msDiff, mapWidth, mapHeight, color1, color2;

	if(level === null || level === undefined) {
		return;
	}
	msDiff = ms / 1000; // multiplicative factor to handle delays > 1 second
	mapWidth = level.mapWidth();
	mapHeight = level.mapHeight();
	
	// if nulls set to canvas size
	if (mapWidth === null) {
		mapWidth = this.c.width;
	}
	if (mapHeight === null) {
		mapHeight = this.c.height;
	}
	// ms is milliseconds since last input
	this.nextFrame(ms);
	if (input.left) {
		this.vel.x -= this.sideThrust * msDiff;
	}
	if (input.right) {
		this.vel.x += this.sideThrust * msDiff;
	}
	if (input.up) {
		this.vel.y += this.thrust * msDiff;
	} else {
		this.vel.y -= this.gravity * msDiff;
	}

	// clamp velocity
	if (this.vel.x > this.maxVel.x) {
		this.vel.x = this.maxVel.x;
	}
	if (this.vel.x < -this.maxVel.x) {
		this.vel.x = -this.maxVel.x;
	}
	this.pos.x += this.vel.x;

	// check left edge of map
	if (this.pos.x < 0) {
		this.pos.x = 0;
		this.vel.x = 0;
	}
	// check the right edge of the map
	if (this.pos.x + this.drawWidth > mapWidth) {
		this.pos.x = mapWidth - this.drawWidth;
		this.vel.x = 0;
	}

	// load array with player corners with x moved
	this.corners.fill({x: this.pos.x - level.xOffset, y: this.pos.y - level.yOffset}, this, level);

	// check collisions
	if (this.vel.x > 0) {
		color1 = level.colorAt(this.corners.mapTopRight.x, this.corners.mapTopRight.y);
		color2 = level.colorAt(this.corners.mapBotRight.x, this.corners.mapBotRight.y);
		if (color1 === level.specialBlocks.end || color2 === level.specialBlocks.end) {
			console.log('WINNER!');
			engine.pauseFlag = true;
		}
		// moving right
		if (this.corners.mapTopRight === null || this.corners.mapBotRight === null) {
			console.log('invalid values: ' + this.corners.mapTopRight + ', ' + this.corners.mapBotRight);
			// invalid values
		} else if (color1 !== level.specialBlocks.blank && color1 !== level.specialBlocks.start) {
			// something to the right!
			//console.log('hit something going right');
			// move to one left
			this.pos.x = (this.corners.mapBotRight.x * level.scale) - this.drawWidth - 1;
			this.vel.x = 0;
		} else if (color2 !== level.specialBlocks.blank && color2 !== level.specialBlocks.start) {
			// something to the right!
			//console.log('hit something going right');
			// move to one left
			this.pos.x = (this.corners.mapBotRight.x * level.scale) - this.drawWidth - 1;
			this.vel.x = 0;
		}
	} else if (this.vel.x < 0) {
		color1 = level.colorAt(this.corners.mapTopLeft.x, this.corners.mapTopLeft.y);
		color2 = level.colorAt(this.corners.mapBotLeft.x, this.corners.mapBotLeft.y);
		if (color1 === level.specialBlocks.end || color2 === level.specialBlocks.end) {
			console.log('WINNER!');
			engine.pauseFlag = true;
		}
		// moving left
		if (this.corners.mapTopLeft === null || this.corners.mapBotLeft === null) {
			console.log('invalid values: ' + this.corners.mapTopLeft + ', ' + this.corners.mapBotLeft);
			// invalid values
		} else if (color1 !== level.specialBlocks.blank && color1 !== level.specialBlocks.start) {
			// something to the left!
			// don't hit start
			//console.log('hit something going left');
			// move to one right
			this.pos.x = (this.corners.mapBotLeft.x + 1) * level.scale;
			this.vel.x = 0;
		} else if (color2 !== level.specialBlocks.blank && color2 !== level.specialBlocks.start) {
			// something to the left!
			// don't hit start
			//console.log('hit something going left');
			// move to one right
			this.pos.x = (this.corners.mapBotLeft.x + 1) * level.scale;
			this.vel.x = 0;
		}
	}

	if (this.vel.y > this.maxVel.y) {
		this.vel.y = this.maxVel.y;
	}
	if (this.vel.y < -this.maxVel.y) {
		this.vel.y = -this.maxVel.y;
	}
	this.pos.y += this.vel.y;

	if (this.pos.y < 0) {
		// display landing force
		//console.log('Landed with a force of ' + calcLandingForce() + 'N');
		this.pos.y = 0;
		this.vel.y = 0;

		// hit floor, kill left/right momentum
		this.vel.x = 0;
	}

	if (this.pos.y + this.drawHeight > mapHeight) {
		this.pos.y = mapHeight - this.drawHeight;
		this.vel.y = 0;
	}

	// load array with player corners with y moved
	this.corners.fill({x: this.pos.x - level.xOffset, y: this.pos.y - level.yOffset}, this, level);

	// check collision
	if (this.vel.y > 0) {
		color1 = level.colorAt(this.corners.mapTopLeft.x, this.corners.mapTopLeft.y);
		color2 = level.colorAt(this.corners.mapTopRight.x, this.corners.mapTopRight.y);
		if (color1 === level.specialBlocks.end || color2 === level.specialBlocks.end) {
			console.log('WINNER!');
			engine.pauseFlag = true;
		}
		// moving up
		if (this.corners.mapTopLeft === null || this.corners.mapTopRight === null) {
			console.log('invalid values: ' + this.corners.mapTopLeft + ', ' + this.corners.mapTopRight);
			// invalid values
		} else if (color1 !== level.specialBlocks.blank && color1 !== level.specialBlocks.start) {
			// something above!
			//console.log('hit something going up');
			// move to one up
			this.vel.y = 0;
			this.pos.y = (this.corners.mapTopLeft.y * level.scale) - this.drawHeight - 1;
		} else if (color2 !== level.specialBlocks.blank && color2 !== level.specialBlocks.start) {
			// something above!
			//console.log('hit something going up');
			// move to one up
			this.vel.y = 0;
			this.pos.y = (this.corners.mapTopLeft.y * level.scale) - this.drawHeight - 1;
		}
	} else {
		color1 = level.colorAt(this.corners.mapBotLeft.x, this.corners.mapBotLeft.y);
		color2 = level.colorAt(this.corners.mapBotRight.x, this.corners.mapBotRight.y);
		if (color1 === level.specialBlocks.end || color2 === level.specialBlocks.end) {
			console.log('WINNER!');
			engine.pauseFlag = true;
		}
		if (this.corners.mapBotLeft === null || this.corners.mapBotRight === null) {
			console.log('invalid values: ' + this.corners.mapBotLeft + ', ' + this.corners.mapBotRight);
			// invalid values
		} else if (color1 !== level.specialBlocks.blank && color1 !== level.specialBlocks.start) {
			// something below!
			//console.log('hit something going down');
			this.vel.y = 0;

			// stop left/right when hit
			//this.vel.x = 0; // removed this for gameplay feel

			// move to one down
			this.pos.y = (this.corners.mapBotLeft.y + 1) * level.scale;
		} else if (color2 !== level.specialBlocks.blank && color2 !== level.specialBlocks.start) {
			// something below!
			//console.log('hit something going down');
			this.vel.y = 0;

			// stop left/right when hit
			//this.vel.x = 0; // removed this for gameplay feel

			// move to one down
			this.pos.y = (this.corners.mapBotLeft.y + 1) * level.scale;
		}
	}

	// adjust side scrolling
	if (this.pos.x - level.xOffset >= this.c.width / 2) {
		level.xOffset = this.pos.x - (this.c.width / 2);
	}
	if (this.pos.x - level.xOffset < (this.c.width / 2)) {
		level.xOffset = this.pos.x - (this.c.width / 2);
	}
	if (level.xOffset < 0) {
		level.xOffset = 0;
	}
	if (level.xOffset > mapWidth - this.c.width) {
		level.xOffset = mapWidth - this.c.width;
	}

	// adjust side scrolling
	if (this.pos.y - level.yOffset >= this.c.height / 2) {
		level.yOffset = this.pos.y - (this.c.height / 2);
	}
	if (this.pos.y - level.yOffset < (this.c.height / 2)) {
		level.yOffset = this.pos.y - (this.c.height / 2);
	}
	if (level.yOffset < 0) {
		level.yOffset = 0;
	}
	if (level.yOffset > mapHeight - this.c.height) {
		level.yOffset = mapHeight - this.c.height;
	}
};

Player.prototype.draw = function (level) {
	"use strict";
	// draw player
	//ctx.fillStyle = this.color;
	//ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
	if (this.image !== null) {
		this.ctx.drawImage(this.image, (this.currentFrame * this.width), 0, this.width, this.height, this.pos.x - level.xOffset, this.pos.y - level.yOffset,  this.drawWidth, this.drawHeight);
	}
};