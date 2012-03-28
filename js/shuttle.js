var lastUpdate = null;
var backgrounds = [null, null];
var engine = null;
var c, ctx;

// Article: http://www.wired.com/gamelife/2012/03/rj-mical-gdc-speech

var clickDebug =  'Click Debug:';
clickDebug += '<table><tr><td>click</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>canvas</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>game</td><td>(0,0)</td></tr></table>';

var inputKeys = { // defines key codes used for input
	up:		 87, // w
	right:	 68, // d
	left:	 65, // a
	down:	 83, // s
	select:	 69, // e
	quit:	 27, // ESC
	reset:	 82, // r
	pause:	 80, // p
	backMap: 90, // z
	upMap:	 88, // x
	debug:	 70  // f
};

// input state object
var input = {
	up:		 false, // w
	right:	 false, // d
	left:	 false, // a
	down:	 false, // s
	select:	 false, // e
	quit:	 false, // ESC
	reset:	 false, // r
	pause:	 false, // p
	backMap: false, // z
	upMap:	 false, // x
	debug:	 false // f
};

var corners = {
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
	fill: function (point, object) {
		"use strict";
		this.topLeft.x = point.x;
		this.topLeft.y = point.y + object.drawHeight;

		this.topRight.x = point.x + object.drawWidth;
		this.topRight.y = point.y + object.drawHeight;

		this.botLeft.x = point.x;
		this.botLeft.y = point.y;

		this.botRight.x = point.x + object.drawWidth;
		this.botRight.y = point.y;

		this.mapTopLeft = engine.levels[engine.currentLevel].toMapCoord(this.topLeft);
		this.mapTopRight = engine.levels[engine.currentLevel].toMapCoord(this.topRight);
		this.mapBotLeft = engine.levels[engine.currentLevel].toMapCoord(this.botLeft);
		this.mapBotRight = engine.levels[engine.currentLevel].toMapCoord(this.botRight);
	}};

var specialBlocks = {
	blank: '#000000',
	end: '#ff0000',
	start: '#00ff00'
};

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
	this.gameWidth = function () {
		if (this.image === null) {
			return 0;
		}
		return (this.image.width * this.scale);
	};
	this.gameHeight = function () {
		if (this.image === null) {
			return 0;
		}
		return (this.image.height * this.scale);
	};
	this.update = function (ms) {
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
	this.draw = function (gameWorld, clearScreen) {
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
}
// END background class

function Player () {
	"use strict";
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
	this.nextFrame = function (ms) {
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
	this.update = function (ms) {
		"use strict";
		var msDiff, mapWidth, mapHeight, color1, color2;

		msDiff = ms / 1000; // multiplicative factor to handle delays > 1 second
		mapWidth = engine.levels[engine.currentLevel].mapWidth();
		mapHeight = engine.levels[engine.currentLevel].mapHeight();
		// if nulls set to canvas size
		if (mapWidth === null) {
			mapWidth = c.width;
		}
		if (mapHeight === null) {
			mapHeight = c.height;
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
		corners.fill({x: this.pos.x - engine.levels[engine.currentLevel].xOffset, y: this.pos.y - engine.levels[engine.currentLevel].yOffset}, this);

		// check collisions
		if (this.vel.x > 0) {
			color1 = engine.levels[engine.currentLevel].colorAt(corners.mapTopRight.x, corners.mapTopRight.y);
			color2 = engine.levels[engine.currentLevel].colorAt(corners.mapBotRight.x, corners.mapBotRight.y);
			if (color1 === specialBlocks.end || color2 === specialBlocks.end) {
				console.log('WINNER!');
				engine.pauseFlag = true;
			}
			// moving right
			if (corners.mapTopRight === null || corners.mapBotRight === null) {
				console.log('invalid values: ' + corners.mapTopRight + ', ' + corners.mapBotRight);
				// invalid values
			} else if (color1 !== specialBlocks.blank && color1 !== specialBlocks.start) {
				// something to the right!
				//console.log('hit something going right');
				// move to one left
				this.pos.x = (corners.mapBotRight.x * engine.levels[engine.currentLevel].scale) - this.drawWidth - 1;
				this.vel.x = 0;
			} else if (color2 !== specialBlocks.blank && color2 !== specialBlocks.start) {
				// something to the right!
				//console.log('hit something going right');
				// move to one left
				this.pos.x = (corners.mapBotRight.x * engine.levels[engine.currentLevel].scale) - this.drawWidth - 1;
				this.vel.x = 0;
			}
		} else if (this.vel.x < 0) {
			color1 = engine.levels[engine.currentLevel].colorAt(corners.mapTopLeft.x, corners.mapTopLeft.y);
			color2 = engine.levels[engine.currentLevel].colorAt(corners.mapBotLeft.x, corners.mapBotLeft.y);
			if (color1 === specialBlocks.end || color2 === specialBlocks.end) {
				console.log('WINNER!');
				engine.pauseFlag = true;
			}
			// moving left
			if (corners.mapTopLeft === null || corners.mapBotLeft === null) {
				console.log('invalid values: ' + corners.mapTopLeft + ', ' + corners.mapBotLeft);
				// invalid values
			} else if (color1 !== specialBlocks.blank && color1 !== specialBlocks.start) {
				// something to the left!
				// don't hit start
				//console.log('hit something going left');
				// move to one right
				this.pos.x = (corners.mapBotLeft.x + 1) * engine.levels[engine.currentLevel].scale;
				this.vel.x = 0;
			} else if (color2 !== specialBlocks.blank && color2 !== specialBlocks.start) {
				// something to the left!
				// don't hit start
				//console.log('hit something going left');
				// move to one right
				this.pos.x = (corners.mapBotLeft.x + 1) * engine.levels[engine.currentLevel].scale;
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
		corners.fill({x: this.pos.x - engine.levels[engine.currentLevel].xOffset, y: this.pos.y - engine.levels[engine.currentLevel].yOffset}, this);

		// check collision
		if (this.vel.y > 0) {
			color1 = engine.levels[engine.currentLevel].colorAt(corners.mapTopLeft.x, corners.mapTopLeft.y);
			color2 = engine.levels[engine.currentLevel].colorAt(corners.mapTopRight.x, corners.mapTopRight.y);
			if (color1 === specialBlocks.end || color2 === specialBlocks.end) {
				console.log('WINNER!');
				engine.pauseFlag = true;
			}
			// moving up
			if (corners.mapTopLeft === null || corners.mapTopRight === null) {
				console.log('invalid values: ' + corners.mapTopLeft + ', ' + corners.mapTopRight);
				// invalid values
			} else if (color1 !== specialBlocks.blank && color1 !== specialBlocks.start) {
				// something above!
				//console.log('hit something going up');
				// move to one up
				this.vel.y = 0;
				this.pos.y = (corners.mapTopLeft.y * engine.levels[engine.currentLevel].scale) - this.drawHeight - 1;
			} else if (color2 !== specialBlocks.blank && color2 !== specialBlocks.start) {
				// something above!
				//console.log('hit something going up');
				// move to one up
				this.vel.y = 0;
				this.pos.y = (corners.mapTopLeft.y * engine.levels[engine.currentLevel].scale) - this.drawHeight - 1;
			}
		} else {
			color1 = engine.levels[engine.currentLevel].colorAt(corners.mapBotLeft.x, corners.mapBotLeft.y);
			color2 = engine.levels[engine.currentLevel].colorAt(corners.mapBotRight.x, corners.mapBotRight.y);
			if (color1 === specialBlocks.end || color2 === specialBlocks.end) {
				console.log('WINNER!');
				engine.pauseFlag = true;
			}
			if (corners.mapBotLeft === null || corners.mapBotRight === null) {
				console.log('invalid values: ' + corners.mapBotLeft + ', ' + corners.mapBotRight);
				// invalid values
			} else if (color1 !== specialBlocks.blank && color1 !== specialBlocks.start) {
				// something below!
				//console.log('hit something going down');
				this.vel.y = 0;

				// stop left/right when hit
				//this.vel.x = 0; // removed this for gameplay feel

				// move to one down
				this.pos.y = (corners.mapBotLeft.y + 1) * engine.levels[engine.currentLevel].scale;
			} else if (color2 !== specialBlocks.blank && color2 !== specialBlocks.start) {
				// something below!
				//console.log('hit something going down');
				this.vel.y = 0;

				// stop left/right when hit
				//this.vel.x = 0; // removed this for gameplay feel

				// move to one down
				this.pos.y = (corners.mapBotLeft.y + 1) * engine.levels[engine.currentLevel].scale;
			}
		}

		// adjust side scrolling
		if (this.pos.x - engine.levels[engine.currentLevel].xOffset >= c.width / 2) {
			engine.levels[engine.currentLevel].xOffset = this.pos.x - (c.width / 2);
		}
		if (this.pos.x - engine.levels[engine.currentLevel].xOffset < (c.width / 2)) {
			engine.levels[engine.currentLevel].xOffset = this.pos.x - (c.width / 2);
		}
		if (engine.levels[engine.currentLevel].xOffset < 0) {
			engine.levels[engine.currentLevel].xOffset = 0;
		}
		if (engine.levels[engine.currentLevel].xOffset > mapWidth - c.width) {
			engine.levels[engine.currentLevel].xOffset = mapWidth - c.width;
		}

		// adjust side scrolling
		if (this.pos.y - engine.levels[engine.currentLevel].yOffset >= c.height / 2) {
			engine.levels[engine.currentLevel].yOffset = this.pos.y - (c.height / 2);
		}
		if (this.pos.y - engine.levels[engine.currentLevel].yOffset < (c.height / 2)) {
			engine.levels[engine.currentLevel].yOffset = this.pos.y - (c.height / 2);
		}
		if (engine.levels[engine.currentLevel].yOffset < 0) {
			engine.levels[engine.currentLevel].yOffset = 0;
		}
		if (engine.levels[engine.currentLevel].yOffset > mapHeight - c.height) {
			engine.levels[engine.currentLevel].yOffset = mapHeight - c.height;
		}
	};
	this.draw = function () {
		"use strict";
		// draw player
		//ctx.fillStyle = this.color;
		//ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if (this.image !== null) {
			ctx.drawImage(this.image, (this.currentFrame * this.width), 0, this.width, this.height, this.pos.x - engine.levels[engine.currentLevel].xOffset, this.pos.y - engine.levels[engine.currentLevel].yOffset,  this.drawWidth, this.drawHeight);
		}
	};
}

function calcLandingForce() {
	"use strict";
	var playerMass, stoppingTime, acceleration, force;

	// calculate acceleration of stopping, then force accrued
	playerMass = 909.1; // 909.1 kg ~ 2000 lbs.
	stoppingTime = 0.01; // .01 seconds. reasonably close to zero
	acceleration = -player.vel.y / stoppingTime;
	force = playerMass * acceleration; // Newtons
	return force;
}

function handleMouseDown(evt) {
	"use strict";
	if (evt.target.id === 'gameCanvas') {
		if (!input.up) {
			input.up = true;
		}
	}
}

function handleMouseUp(evt) {
	"use strict";
	input.up = false;
}

function handleKeyDown(evt) {
	"use strict";

	//console.log(evt.keyCode);
	switch (evt.keyCode) {
	case inputKeys.quit: // ESC Key
		input.quit = true;
		engine.exitFlag = true;
		//console.log('Exiting Game');
		break;

	case inputKeys.left: // Left Key
		if (!input.left) {
			//console.log('left pressed');
			input.left = true;
		}
		break;

	case inputKeys.right: // Right Key
		if (!input.right) {
			//console.log('right pressed');
			input.right = true;
		}
		break;

	case inputKeys.up: // Up Key
		if (!input.up) {
			input.up = true;
		}
		break;

	case inputKeys.down: // Down Key
		if (!input.down) {
			input.down = true;
		}
		break;

	case inputKeys.pause: // pause Key
		if (!input.pause) {
			input.pause = true;
			engine.pauseFlag = !engine.pauseFlag; // toggle
		}
		break;

	case inputKeys.reset: // reset
		if (!input.reset) {
			input.reset = true;
			engine.resetLevel();
		}
		break;

	case inputKeys.backMap: // backMap Key
		if (!input.backMap) {
			input.backMap = true;
			engine.prevLevel();
		}
		break;

	case inputKeys.upMap: // upMap Key
		if (!input.upMap) {
			input.upMap = true;
			engine.nextLevel();
		}
		break;

	case inputKeys.debug: // debug Key
		if (!input.debug) {
			input.debug = true;
		}
		break;

	case inputKeys.select: // select Key
		if (!input.select) {
			input.select = true;
		}
		break;

	default:
		console.log('unknown key pressed: ' + evt.keyCode);
		break;
	}
}

function handleKeyUp(evt) {
	"use strict";
	//console.log(evt.keyCode);
	switch (evt.keyCode) {
	case inputKeys.left: // Left Key
		//console.log('left released');
		input.left = false;
		break;

	case inputKeys.right: // Right Key
		//console.log('right released');
		input.right = false;
		break;

	case inputKeys.up: // Up Key
		//console.log('up released');
		input.up = false;
		break;

	case inputKeys.down: // Down Key
		//console.log('up released');
		input.down = false;
		break;

	case inputKeys.quit: // quit Key
		input.quit = false;
		break;

	case inputKeys.pause: // pause Key
		input.pause = false;
		break;

	case inputKeys.reset: // reset Key
		input.reset = false;
		break;

	case inputKeys.backMap: // backMap Key
		input.backMap = false;
		break;

	case inputKeys.upMap: // upMap Key
		input.upMap = false;
		break;

	case inputKeys.debug: // debug Key
		input.debug = false;
		break;
		
	case inputKeys.select: // select Key
		input.select = false;
		break;

	default:
		console.log('unknown key released: ' + evt.keyCode);
		break;
	}
}

function drawDebugGrid(method) {
	"use strict";
	var x, y;
	switch (method) {
	case 'grid':
		ctx.strokeStyle = '#ff0000';
		for (x = 0; x < c.width; x += engine.levels[engine.currentLevel].scale) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, c.height);
			ctx.stroke();
		}
		for (y = 0; y < c.height; y += engine.levels[engine.currentLevel].scale) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(c.width, y);
			ctx.stroke();
		}
		break;

	case 'crosshair':
		ctx.strokeStyle = '#ff0000';
		ctx.beginPath();
		ctx.moveTo(0, c.height / 2);
		ctx.lineTo(c.width, c.height / 2);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(c.width / 2, 0);
		ctx.lineTo(c.width / 2, c.height);
		ctx.stroke();
		break;
	}
}

function gameLoop() {
	"use strict";
	var timeChange, newUpdate, i;

	newUpdate = new Date();
	if (!lastUpdate) {
		lastUpdate = newUpdate;
	}

	$('#gameDebug').html(clickDebug);

	if (!engine.exitFlag && !engine.pauseFlag && engine !== null) {
		timeChange = newUpdate - lastUpdate;

		for (i = 0; i < backgrounds.length; i += 1) {
			backgrounds[i].update(timeChange);
		}
		engine.update(timeChange);
	}

	// draw bg's
	for (i = 0; i < backgrounds.length; i += 1) {
		if (backgrounds[i] !== null) {
			if (i === 0) {
				// clear bg on first one
				backgrounds[i].draw(engine.levels[engine.currentLevel], true);
			} else {
				backgrounds[i].draw(engine.levels[engine.currentLevel], false);
			}
		}
	}

	// draw engine
	engine.draw();
	
	// draw debug grid if necessary
	//drawDebugGrid('grid'); // 'crosshair' or 'grid'

	lastUpdate = newUpdate;
}

function loadImages() {
	"use strict";
	// preload images	
	var imageManager = new ImageLoader();

	imageManager.queueDownload('images/tardis1.png');
	imageManager.queueDownload('images/tardis_spin.png');
	imageManager.queueDownload('images/spacebg64x64.png');
	imageManager.queueDownload('images/bgstars.png');
	imageManager.queueDownload('images/level1.png');
	imageManager.queueDownload('images/level2.png');

	imageManager.downloadAll(function () {
		var temp;
		backgrounds[0].image = imageManager.getAsset('images/spacebg64x64.png');
		backgrounds[1].image = imageManager.getAsset('images/bgstars.png');

		engine.addLevel(imageManager.getAsset('images/level1.png'));
		engine.addLevel(imageManager.getAsset('images/level2.png'));
		engine.resetLevel();
		
		engine.player.image = imageManager.getAsset('images/tardis_spin.png');
		engine.player.frames = 5;
		engine.player.width = (engine.player.image.width / engine.player.frames);
		engine.player.height = engine.player.image.height;
	});
}

function setupCanvas() {
	"use strict";
	// define graphics contexts
	c = document.getElementById("gameCanvas");
	ctx = c.getContext("2d");

	// canvas defaults
	ctx.lineWidth = 1;

	// flip image and translate down to fix coordinates
	ctx.scale(1, -1); // flip over x axis
	ctx.translate(0, -c.height); // move (0,0) to bottom left to match cartisian plane 
	ctx.translate(0.5, 0.5); // offset for aliasing

}

$(function () {
	"use strict";
	engine = new GameEngine();

	// initizlise background objects
	backgrounds[0] = new Background();
	backgrounds[0].scrollFactor.x = 0.25;
	backgrounds[0].scrollFactor.y = 0.25;
	backgrounds[0].scale = 2;

	backgrounds[1] = new Background();
	backgrounds[1].scrollFactor.x = 0.5;
	backgrounds[1].scrollFactor.y = 0.5;
	backgrounds[1].scale = 0.8;
	backgrounds[1].velocity.x = -40;

	// on ready
	setupCanvas();
	loadImages(); //TODO: async, need to wait for finish before moving on.

	// add listeners for keyboard input
	window.addEventListener('keydown', handleKeyDown, true);
	window.addEventListener('keyup', handleKeyUp, true);
	window.addEventListener('mousedown', handleMouseDown, true);
	window.addEventListener('mouseup', handleMouseUp, true);

	// debug
	$("#gameCanvas").click(function (e) {
		var gc, x, y, map;
		gc = $("#gameCanvas");
	    x = e.pageX - gc.offset().left;
	    y = e.pageY - gc.offset().top;
	    map = engine.levels[engine.currentLevel].toMapCoord({x: x, y: c.height - y});
		clickDebug =  'Click Debug:';
		clickDebug += '<table><tr><td>click</td><td>(' + e.pageX + ', ' + e.pageY + ')</td></tr>';
		clickDebug += '<tr><td>canvas</td><td>(' + Math.round(x) + ', ' + Math.round(y) + ')</td></tr>';
		clickDebug += '<tr><td>game</td><td>(' + Math.round(x) + ', ' + (c.height - Math.round(y)) + ')</td></tr>';
		clickDebug += '<tr><td>map</td><td>(' + Math.round(map.x) + ', ' + Math.round(map.y) + ')</td></tr>';
		clickDebug += '<tr><td>color</td><td>(' + engine.levels[engine.currentLevel].colorAt(map.x, map.y) + ')</td></tr></table>';
	});

	//BEGIN RAF SHIM
	// reference: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();
	// END RAF SHIM

	(function animloop() {
		requestAnimFrame(animloop);
		gameLoop();
    })();
});

function Level() {
	"use strict";
	this.level_map = null;
	this.map_data = null;
	this.xOffset = 0;
	this.yOffset = 0;
	this.scale = 40;
	this.scaleMinusOne = 39;
	this.gravity = 7;
	this.mapWidth = function () {
		var returnValue = null;
		if (this.level_map !== null) {
			returnValue = this.level_map.width * this.scale;
		}
		return returnValue;
	};
	this.mapHeight = function () {
		var returnValue = null;
		if (this.level_map !== null) {
			returnValue = this.level_map.height * this.scale;
		}
		return returnValue;
	};
	this.colorAt = function (x, y) {
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
	this.getStart = function () {
		var x, y;
		for (x = 0; x < this.level_map.width; x += 1) {
			for (y = 0; y < this.level_map.height; y += 1) {
				if (this.colorAt(x, y) === specialBlocks.start) {
					return ({x: x, y: y});
				}
			}
		}
		return ({x: 0, y: 0});
	};
	this.getEnd = function () {
		var x, y;
		for (x = 0; x < this.level_map.width; x += 1) {
			for (y = 0; y < this.level_map.height; y += 1) {
				if (this.colorAt(x, y) === specialBlocks.end) {
					return ({x: x, y: y});
				}
			}
		}
		return ({x: 0, y: 0});
	};
	this.draw = function () {
		var blockCount, xDraw, yDraw, x, y, thisColor;
		blockCount = 0;
		if (this.map_data !== null) {
			// precalculate max x value in map array
			xDraw = Math.floor(this.xOffset / this.scale) + Math.floor(c.width / this.scale) + 1;
			yDraw = Math.floor(this.yOffset / this.scale) + Math.floor(c.height / this.scale) + 1;
			for (y = Math.floor(this.yOffset / this.scale); y < this.level_map.height; y += 1) {
				for (x = Math.floor(this.xOffset / this.scale); x < xDraw; x += 1) {
					thisColor = this.colorAt(x, y);
					if (thisColor !== specialBlocks.blank) { // don't draw blank tiles
						// only draw if near canvas
						if ((x * this.scale) - this.xOffset >= -this.scale && (x * this.scale) - this.xOffset <= c.width) {
							if ((y * this.scale) - this.yOffset >= -this.scale && (y * this.scale) - this.yOffset <= c.height) {
								//TODO add bounds checking for yOffset too
								ctx.fillStyle = thisColor;
								ctx.fillRect((x * this.scale) - this.xOffset, (y * this.scale) - this.yOffset, this.scale, this.scale);
								if (input.debug) {
									console.log(blockCount + ': Drawing block (' + x + ', ' + y + ') with color ' + thisColor);
								}
								blockCount += 1;
							}
						}
					}
				}
			}
		}
		if (input.debug) {
			input.debug = false;
		}
	};
	this.toMapCoord = function (point) {
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
}

// BEGIN GameEngine
function GameEngine() {
	"use strict";
	this.exitFlag = false;
	this.pauseFlag = true;
	this.levels = [];
	this.player = new Player();
	this.currentLevel = 0;
	this.levelTimer = 0;
	this.startCountdown = 3000;
	this.addLevel = function (levelMap) {
		var levelID = this.levels.length;
		
		this.levels.push(new Level());
		// load level image map
		this.levels[levelID].level_map = levelMap;
		
		// save current context configuration
		ctx.save()
		// undo translations so image loading is normal
		ctx.translate(0, c.height);
		ctx.scale(1, -1);
		ctx.translate(-0.5, 0); // offset for aliasing

		// draw map for grabbing data
		ctx.drawImage(this.levels[levelID].level_map, 0, 0);
		// load image into map data
		this.levels[levelID].map_data = ctx.getImageData(0, 0, this.levels[levelID].level_map.width, this.levels[levelID].level_map.height).data;
		// clear level map
		ctx.clearRect(0, 0, c.width, c.height);
		
		// restore context
		ctx.restore();		
	};
	this.nextLevel = function () {
		this.currentLevel += 1;
		if (this.currentLevel >= this.levels.length) {
			this.currentLevel = 0;
		}
		this.resetLevel();
	};
	this.prevLevel = function () {
		this.currentLevel -= 1;
		if (this.currentLevel < 0) {
			this.currentLevel = this.levels.length - 1;
		}
		this.resetLevel();
	};
	this.resetLevel = function () {
		var temp = this.levels[engine.currentLevel].getStart();
		
		this.player.pos.x = temp.x * this.levels[engine.currentLevel].scale;
		this.player.pos.y = temp.y * this.levels[engine.currentLevel].scale;
		this.player.vel.x = 0;
		this.player.vel.y = 0;
		this.levelTimer = 0;
		this.pauseFlag = true;
		this.player.update(0);
	}
	this.update = function (ms) {
		this.levelTimer += ms;
		this.player.update(ms);
	};
	this.draw = function () {
		// draw level
		this.levels[this.currentLevel].draw();
		
		// draw player
		this.player.draw();
		
		// draw timer
		this.drawTimer();
		
		// if paused, show pause flag
		if (this.pauseFlag === true) {
			// set font properties
			ctx.fillStyle = '#ff0000';
			ctx.font = '48px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			
			// save current context configuration
			ctx.save()
			// undo translations so text appears normal
			ctx.translate(0, c.height);
			ctx.scale(1, -1);
			
			// draw text
			ctx.fillText('PAUSED!', c.width / 2, c.height / 2);
			
			// restore context
			ctx.restore();
		}
	};
	this.drawTimer = function () {
		// parse timer
		var min = 0, sec = 0, timer = this.levelTimer.valueOf();
		
		min = Math.floor(timer / 60000);
		timer -= 60000 * min;
		// convert to string :)
		if (min < 10) {
			min = '0' + min.toString();
		} else {
			min = min.toString();
		}
		
		sec = timer / 1000;
		// convert to string :)
		if (sec < 10) {
			sec = '0' + sec.toFixed(3);
		} else {
			sec = sec.toFixed(3);
		}

		// set font properties
		ctx.fillStyle = '#ff0000';
		ctx.font = '30px sans-serif';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'bottom';
		
		// save current context configuration
		ctx.save()
		// undo translations so text appears normal
		ctx.translate(0, c.height);
		ctx.scale(1, -1);
		
		// draw text
		ctx.fillText(min + ':' + sec, c.width - 150, 40);
		
		// restore context
		ctx.restore();
	};
}
// END GameEngine

// BEGIN ImageLoader Scripts
// ImageLoader based on http://www.html5rocks.com/en/tutorials/games/assetmanager/
function ImageLoader() {
	"use strict";
	this.successCount = 0;
	this.errorCount = 0;
	this.downloadQueue = [];
	this.cache = {};
}

ImageLoader.prototype.queueDownload = function (path) {
	"use strict";
	this.downloadQueue.push(path);
}

ImageLoader.prototype.downloadAll = function (downloadCallback) {
	"use strict";
	var i, path, img, that;
	if (this.downloadQueue.length === 0) {
		downloadCallback();
	} else {
		for(i = 0; i < this.downloadQueue.length; i += 1) {
			path = this.downloadQueue[i];
			img = new Image();
			that = this;
			img.addEventListener("load", function() {
				that.successCount += 1;
				if(that.isDone()) {
					downloadCallback();
				}
			}, false);
			img.addEventListener("error", function() {
				that.errorCount += 1;
				if(that.isDone()) {
					downloadCallback();
				}
			}, false);
			img.src = path;
			this.cache[path] = img;
		}
	}
}

ImageLoader.prototype.isDone = function () {
	"use strict";
	return(this.downloadQueue.length === (this.successCount + this.errorCount));
}

ImageLoader.prototype.getAsset = function (path) {
	"use strict";
	return this.cache[path];
}
// END ImageLoader Scripts