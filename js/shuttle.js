var exitFlag = false;
var pauseFlag = false;
var lastUpdate = null;
var backgrounds = [null, null];
var c, ctx;

// Article: http://www.wired.com/gamelife/2012/03/rj-mical-gdc-speech

var clickDebug =  'Click Debug:';
clickDebug += '<table><tr><td>click</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>canvas</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>game</td><td>(0,0)</td></tr></table>';

var inputKeys = { // defines key codes used for input
	up: 87, // w
	right: 68, // d
	left: 65, // a
	quit: 27, // ESC
	pause: 80, // p
	backMap: 90, // z
	upMap: 88, // x
	debug: 70 // f
}

var corners = {
	topLeft: {
		x: null, y: null
	},
	topRight: {
		x: null, y: null
	},
	botLeft: {
		x: null, y: null
	},
	botRight: {
		x: null, y: null
	},
	mapTopLeft: {
		x: null, y: null
	},
	mapTopRight: {
		x: null, y: null
	},
	mapBotLeft: {
		x: null, y: null
	},
	mapBotRight: {
		x: null, y: null
	},
	fill: function(point, object) {
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
		//this.debugOutput();
	},
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Corner Debug:<table border="1"><tr><td></td><td>x,y</td><td>map x,y</td><td>at map x,y</td></tr>';
		debugOutput += '<tr><td>topLeft</td><td>(' + this.topLeft.x.toFixed(1) + ', ' + this.topLeft.y.toFixed(1) + ')</td><td>(' + this.mapTopLeft.x + ', ' + this.mapTopLeft.y + ')</td><td>' + level.map[this.mapTopLeft.y][this.mapTopLeft.x] + '</td></tr>';
		debugOutput += '<tr><td>topRight</td><td>(' + this.topRight.x.toFixed(1) + ', ' + this.topRight.y.toFixed(1) + ')</td><td>(' + this.mapTopRight.x + ', ' + this.mapTopRight.y + ')</td><td>' + level.map[this.mapTopRight.y][this.mapTopRight.x] + '</td></tr>';
		debugOutput += '<tr><td>botLeft</td><td>(' + this.botLeft.x.toFixed(1) + ', ' + this.botLeft.y.toFixed(1) + ')</td><td>(' + this.mapBotLeft.x + ', ' + this.mapBotLeft.y + ')</td><td>' + level.map[this.mapBotLeft.y][this.mapBotLeft.x] + '</td></tr>';
		debugOutput += '<tr><td>botRight</td><td>(' + this.botRight.x.toFixed(1) + ', ' + this.botRight.y.toFixed(1) + ')</td><td>(' + this.mapBotRight.x + ', ' + this.mapBotRight.y + ')</td><td>' + level.map[this.mapBotRight.y][this.mapBotRight.x] + '</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	}	
}

var specialBlocks = new Object();
specialBlocks['blank'] = '#000000';
specialBlocks['end'] = '#ff0000';
specialBlocks['start'] = '#00ff00';

// input state object
var input = {
	left: false,
	up: false,
	right: false,
	quit: false,
	pause: false,
	backMap: false,
	upMap: false,
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Input Debug:';
		debugOutput += '<table><tr><td>up</td><td>(' + this.up + ')</td></tr>';
		debugOutput += '<tr><td>left</td><td>(' + this.left + ')</td></tr>';
		debugOutput += '<tr><td>right</td><td>(' + this.right + ')</td></tr>';
		debugOutput += '<tr><td>pause</td><td>(' + this.pause + ')</td></tr>';
		debugOutput += '<tr><td>backMap</td><td>(' + this.backMap + ')</td></tr>';
		debugOutput += '<tr><td>upMap</td><td>(' + this.upMap + ')</td></tr>';
		debugOutput += '<tr><td>quit</td><td>(' + this.quit + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	}	
}

var player = {
	width: 0,
	height: 0,
	drawWidth: 34,
	drawHeight: 50,
	pos: { // player position
		x: 512,
		y: 550
	},
	vel: { // player velocity
		x: 0, y: 0 
	},
	maxVel: {
		x: 20, y: 20
	},
	color: '#ffffff',
	thrust: 12,
	sideThrust: 12,
	gravity: 12,
	image: null,
	frames: 5,
	fps: 20,
	currentFrame: 0,
	timeCounter: 0,
	nextFrame: function(ms) {
		this.timeCounter += ms;
		if(this.timeCounter > (1000 / this.fps)) {
			this.currentFrame++;
			this.timeCounter = 0;
		}
		if(this.currentFrame >= this.frames) this.currentFrame = 0;
	},
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Player Debug:';
		debugOutput += '<table><tr><td>pos</td><td>(' + this.pos.x.toFixed(2) + ', ' + this.pos.y.toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>vel</td><td>(' + this.vel.x.toFixed(2) + ', ' + this.vel.y.toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>frame</td><td>(' + this.currentFrame + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	},
	update: function(ms) {
		this.debugOutput();
		var mapWidth = level.mapWidth();
		var mapHeight = level.mapHeight();
		// if nulls set to canvas size
		if(mapWidth === null) {
			mapWidth = c.width;
		}
		if(mapHeight === null) {
			mapHeight = c.height;
		}
		// ms is milliseconds since last input
		var msDiff = ms / 1000; // multiplicative factor to handle delays > 1 second
		this.nextFrame(ms);
		if(input.left) {
			this.vel.x -= this.sideThrust * msDiff;
		}		
		if(input.right) {
			this.vel.x += this.sideThrust * msDiff;
		}
		if(input.up) {
			this.vel.y += this.thrust * msDiff;
		} else {
			this.vel.y -= this.gravity * msDiff;
		}
		
		// clamp velocity
		if(this.vel.x > this.maxVel.x) this.vel.x = this.maxVel.x;
		if(this.vel.x < -this.maxVel.x) this.vel.x = -this.maxVel.x;
		this.pos.x += this.vel.x;
		
		// check left edge of map
		if(this.pos.x < 0) {
			this.pos.x = 0;
			this.vel.x = 0;
		}
		// check the right edge of the map
		if(this.pos.x + this.drawWidth > mapWidth) {
			this.pos.x = mapWidth - this.drawWidth;
			this.vel.x = 0;
		}

		// load array with player corners with x moved
		corners.fill({x: this.pos.x - level.xOffset, y: this.pos.y - level.yOffset}, this);
		
		// check collisions
		if(this.vel.x > 0) {
			var color1 = level.colorAt(corners.mapTopRight.x, corners.mapTopRight.y);
			var color2 = level.colorAt(corners.mapBotRight.x, corners.mapBotRight.y);
			if(color1 === specialBlocks['end'] || color2 === specialBlocks['end']) {
				console.log('WINNER!');
			}
			// moving right
			if(corners.mapTopRight === null || corners.mapBotRight === null) {
				console.log('invalid values: ' + corners.mapTopRight + ', ' + corners.mapBotRight);
				// invalid values
			} else if(color1 !== specialBlocks['blank'] && color1 !== specialBlocks['start']) {
				// something to the right!
				//console.log('hit something going right');
				// move to one left
				this.pos.x = (corners.mapBotRight.x * level.scale) - this.drawWidth - 1;
				this.vel.x = 0;
			} else if(color2 !== specialBlocks['blank'] && color2 !== specialBlocks['start']) {
				// something to the right!
				//console.log('hit something going right');
				// move to one left
				this.pos.x = (corners.mapBotRight.x * level.scale) - this.drawWidth - 1;
				this.vel.x = 0;
			}
		} else if(this.vel.x < 0) {
			var color1 = level.colorAt(corners.mapTopLeft.x, corners.mapTopLeft.y);
			var color2 = level.colorAt(corners.mapBotLeft.x, corners.mapBotLeft.y);
			if(color1 === specialBlocks['end'] || color2 === specialBlocks['end']) {
				console.log('WINNER!');
			}
			// moving left
			if(corners.mapTopLeft === null || corners.mapBotLeft === null) {
				console.log('invalid values: ' + corners.mapTopLeft + ', ' + corners.mapBotLeft);
				// invalid values
			} else if(color1 !== specialBlocks['blank'] && color1 !== specialBlocks['start']) {
				// something to the left!
				// don't hit start
				//console.log('hit something going left');
				// move to one right
				this.pos.x = (corners.mapBotLeft.x + 1) * level.scale;
				this.vel.x = 0;
			} else if(color2 !== specialBlocks['blank'] && color2 !== specialBlocks['start']) {
				// something to the left!
				// don't hit start
				//console.log('hit something going left');
				// move to one right
				this.pos.x = (corners.mapBotLeft.x + 1) * level.scale;
				this.vel.x = 0;
			}
		}
		
		if(this.vel.y > this.maxVel.y) this.vel.y = this.maxVel.y;
		if(this.vel.y < -this.maxVel.y) this.vel.y = -this.maxVel.y;
		this.pos.y += this.vel.y;
				
		if(this.pos.y < 0) {
			// display landing force
			//console.log('Landed with a force of ' + calcLandingForce() + 'N');
			this.pos.y = 0;
			this.vel.y = 0;
			
			// hit floor, kill left/right momentum
			this.vel.x = 0;
		}
		
		if(this.pos.y + this.drawHeight > mapHeight) {
			this.pos.y = mapHeight - this.drawHeight;
			this.vel.y = 0;
		}

		// load array with player corners with y moved
		corners.fill({x: this.pos.x - level.xOffset, y: this.pos.y - level.yOffset}, this);

		// check collision
		if(this.vel.y > 0) {
			var color1 = level.colorAt(corners.mapTopLeft.x, corners.mapTopLeft.y);
			var color2 = level.colorAt(corners.mapTopRight.x, corners.mapTopRight.y);
			if(color1 === specialBlocks['end'] || color2 === specialBlocks['end']) {
				console.log('WINNER!');
			}
			// moving up
			if(corners.mapTopLeft === null || corners.mapTopRight === null) {
				console.log('invalid values: ' + corners.mapTopLeft + ', ' + corners.mapTopRight);
				// invalid values
			} else if(color1 !== specialBlocks['blank'] && color1 !== specialBlocks['start']) {
				// something above!
				//console.log('hit something going up');
				// move to one up
				this.vel.y = 0;
				this.pos.y = (corners.mapTopLeft.y * level.scale) - this.drawHeight - 1;
			} else if(color2 !== specialBlocks['blank'] && color2 !== specialBlocks['start']) {
				// something above!
				//console.log('hit something going up');
				// move to one up
				this.vel.y = 0;
				this.pos.y = (corners.mapTopLeft.y * level.scale) - this.drawHeight - 1;
			}
		} else {
			var color1 = level.colorAt(corners.mapBotLeft.x, corners.mapBotLeft.y);
			var color2 = level.colorAt(corners.mapBotRight.x, corners.mapBotRight.y);
			if(color1 === specialBlocks['end'] || color2 === specialBlocks['end']) {
				console.log('WINNER!');
			}
			if(corners.mapBotLeft === null || corners.mapBotRight === null) {
				console.log('invalid values: ' + corners.mapBotLeft + ', ' + corners.mapBotRight);
				// invalid values
			} else if(color1 !== specialBlocks['blank'] && color1 !== specialBlocks['start']) {
				// something below!
				//console.log('hit something going down');
				this.vel.y = 0;
				
				// stop left/right when hit
				//this.vel.x = 0; // removed this for gameplay feel

				// move to one down
				this.pos.y = (corners.mapBotLeft.y + 1) * level.scale;
			} else if(color2 !== specialBlocks['blank'] && color2 !== specialBlocks['start']) {
				// something below!
				//console.log('hit something going down');
				this.vel.y = 0;
				
				// stop left/right when hit
				//this.vel.x = 0; // removed this for gameplay feel

				// move to one down
				this.pos.y = (corners.mapBotLeft.y + 1) * level.scale;
			}
		}

		
		// adjust side scrolling
		if(this.pos.x - level.xOffset >= c.width / 2) {
			level.xOffset = this.pos.x - (c.width / 2);			
		}
		if(this.pos.x - level.xOffset < (c.width / 2)) {
			level.xOffset = this.pos.x - (c.width / 2);
		}
		if(level.xOffset < 0) {
			level.xOffset = 0;
		}
		if(level.xOffset > mapWidth - c.width) {
			level.xOffset = mapWidth - c.width;
		}

		// adjust side scrolling
		if(this.pos.y - level.yOffset >= c.height / 2) {
			level.yOffset = this.pos.y - (c.height / 2);			
		}
		if(this.pos.y - level.yOffset < (c.height / 2)) {
			level.yOffset = this.pos.y - (c.height / 2);
		}
		if(level.yOffset < 0) {
			level.yOffset = 0;
		}
		if(level.yOffset > mapHeight - c.height) {
			level.yOffset = mapHeight - c.height;
		}

	},
	draw: function() {
		// draw player
		//ctx.fillStyle = this.color;
		//ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if(player.image !== null) {
			ctx.drawImage(this.image, (this.currentFrame * this.width), 0, this.width, this.height, this.pos.x - level.xOffset, this.pos.y - level.yOffset,  this.drawWidth, this.drawHeight);
		}
	}
}

function calcLandingForce() {
	// calculate acceleration of stopping, then force accrued
	var playerMass = 909.1; // 909.1 kg ~ 2000 lbs.
	var stoppingTime = 0.01; // .01 seconds. reasonably close to zero
	var acceleration = -player.vel.y / stoppingTime; //
	var force = playerMass * acceleration; // Newtons
	return force; 
}

function handleMouseDown(evt) {
	if(evt.target.id == 'gameCanvas') {
		if(!input.up) {
			input.up = true;
		}
	}
}

function handleMouseUp(evt) {
	input.up = false;
}

function handleKeyDown(evt) {
	//console.log(evt.keyCode);
	switch(evt.keyCode) {
		case inputKeys.quit: // ESC Key
			input.quit = true;
			exitFlag = true;
			//console.log('Exiting Game');
			break;
			
		case inputKeys.left: // Left Key
			if(!input.left) {
				//console.log('left pressed');
				input.left = true;
			}
			break;
		
		case inputKeys.right: // Right Key
			if(!input.right) {
				//console.log('right pressed');
				input.right = true;
			}
			break;
		
		case inputKeys.up: // Up Key
			if(!input.up) {
				input.up = true;
			}
			break;
		
		case inputKeys.pause: // pause Key
			if(!input.pause) {
				input.pause = true;
				pauseFlag = !pauseFlag; // toggle
			}
			break;
		
		case inputKeys.backMap: // backMap Key
			if(!input.backMap) {
				input.backMap = true;
			}
			break;
		
		case inputKeys.upMap: // upMap Key
			if(!input.upMap) {
				input.upMap = true;
			}
			break;
		
		case inputKeys.debug: // debug Key
			if(!input.debug) {
				input.debug = true;
			}
			break;
		
		default:
			console.log('unknown key pressed: ' + evt.keyCode)
	}
}

function handleKeyUp(evt) {
	//console.log(evt.keyCode);
	switch(evt.keyCode) {
			
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
		
		case inputKeys.quit: // quit Key
			input.quit = false;
			break;
		
		case inputKeys.pause: // pause Key
			input.pause = false;
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
		
		default:
			console.log('unknown key released: ' + evt.keyCode)
	}
}

function drawDebugGrid(method) {
	switch(method) {
		case 'grid':
			ctx.strokeStyle = '#ff0000';
			for(var x = 0; x < c.width; x+=level.scale) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, c.height);
				ctx.stroke();
			}
			for(var y = 0; y < c.height; y += level.scale) {
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
	var newUpdate = new Date();
	if(!lastUpdate) {
		lastUpdate = newUpdate;
	}
					
	$('#gameDebug').html(clickDebug);		
	input.debugOutput();
	if(!exitFlag && !pauseFlag) {

		// draw bg's
		for(var i = 0; i < backgrounds.length; i++) {
			if(backgrounds[i] !== null) {
				backgrounds[i].update(newUpdate - lastUpdate);
				if(i === 0) {
					// clear bg on first one
					backgrounds[i].draw(level, true);
				} else {
					backgrounds[i].draw(level, false);
				}
			}
		}

		level.draw();
		drawDebugGrid(); // 'crosshair' or 'grid'
		player.draw();
		player.update(newUpdate - lastUpdate);
	} else {
		//player.debugOutput();
	}
	lastUpdate = newUpdate;				 	
}

function loadImages() {
	// preload images	
	var imageManager = new ImageLoader();
	
	imageManager.queueDownload('images/tardis1.png');
	imageManager.queueDownload('images/tardis_spin.png');
	imageManager.queueDownload('images/spacebg64x64.png');
	imageManager.queueDownload('images/bgstars.png');
	imageManager.queueDownload('images/level1.png');
	imageManager.queueDownload('images/level2.png');
	
	imageManager.downloadAll(function() {
		backgrounds[0].image = imageManager.getAsset('images/spacebg64x64.png');
		backgrounds[1].image = imageManager.getAsset('images/bgstars.png');
		
		// load level image map
		level.level_map = imageManager.getAsset('images/level1.png');
		ctx.drawImage(level.level_map, 0, 0);
		// load image into map data
		level.map_data = ctx.getImageData(0, 0, level.level_map.width, level.level_map.height).data;
		// clear level map
		ctx.clearRect(0, 0, c.width, c.height);
		var temp = level.getStart();
		player.pos.x = temp.x * level.scale;
		player.pos.y = (temp.y + 1) * level.scale;
	
		// flip image and translate down to fix coordinates
		ctx.scale(1, -1); // flip over x axis
		ctx.translate(0, -c.height); // move (0,0) to bottom left to match cartisian plane 
		ctx.translate(0.5, 0.5); // offset for aliasing

		
		player.image = imageManager.getAsset('images/tardis_spin.png');
		player.frames = 5;
		player.width = (player.image.width / player.frames);
		player.height = player.image.height;
	});
}

function setupCanvas() {
	// define graphics contexts
	c = document.getElementById("gameCanvas");
	ctx = c.getContext("2d");

	// canvas defaults
	ctx.lineWidth = 1;

	// set more after loading bg image
}

$(function() {
	// initizlise background objects
	backgrounds[0] = new background();
	backgrounds[0].scrollFactor.x = 0.25;
	backgrounds[0].scrollFactor.y = 0.25;
	backgrounds[0].scale = 2;

	backgrounds[1] = new background();
	backgrounds[1].scrollFactor.x = 0.5;
	backgrounds[1].scrollFactor.y = 0.5;
	backgrounds[1].scale = 0.8;
	backgrounds[1].velocity.x = -10;

	// on ready
	setupCanvas();
	loadImages(); //TODO: async, need to wait for finish before moving on.
	
	// add listeners for keyboard input
	window.addEventListener('keydown', handleKeyDown, true);
	window.addEventListener('keyup', handleKeyUp, true);
	window.addEventListener('mousedown', handleMouseDown, true);
	window.addEventListener('mouseup', handleMouseUp, true);
	
	// debug
	$("#gameCanvas").click(function(e){
		var gc = $("#gameCanvas");
	    var x = e.pageX - gc.offset().left;
	    var y = e.pageY - gc.offset().top;
	    var map = level.toMapCoord({x: x, y: c.height - y});
	    
		clickDebug =  'Click Debug:';
		clickDebug += '<table><tr><td>click</td><td>(' + e.pageX + ', ' + e.pageY + ')</td></tr>';
		clickDebug += '<tr><td>canvas</td><td>(' + Math.round(x) + ', ' + Math.round(y) + ')</td></tr>';
		clickDebug += '<tr><td>game</td><td>(' + Math.round(x) + ', ' + (c.height - Math.round(y)) + ')</td></tr>';
		clickDebug += '<tr><td>map</td><td>(' + Math.round(map.x) + ', ' + Math.round(map.y) + ')</td></tr>';
		clickDebug += '<tr><td>color</td><td>(' + level.colorAt(map.x, map.y) + ')</td></tr></table>';
	});

	(function animloop(){
      requestAnimFrame(animloop);
      gameLoop();
    })();
});

//BEGIN RAF SHIM
// reference: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return	window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();
// END RAF SHIM

var level = {
	level_map: null,
	map_data: null,
	xOffset: 0,
	yOffset: 0,
	scale: 40,
	scaleMinusOne: 39,
	gravity: 7,
	mapWidth: function() {
		if(this.level_map !== null) {
			return(this.level_map.width * this.scale);
		} else {
			return null;
		}
		
	},
	mapHeight: function() {
		if(this.level_map !== null) { 
			return(this.level_map.height * this.scale);
		} else {
			return null;
		}
	},
	colorAt: function(x, y) {
		var output = '#000000';
		if(this.map_data !== null) {
			if(x >= 0 && y >= 0 && x < this.level_map.width && y < this.level_map.height) {
				var start = (y * this.level_map.width * 4) + (x * 4); // 4 elements per pixel RGBA
				try {
					output = '#';
					//(this.map_data[first]).toString(16) + (this.map_data[first + 1]).toString(16) + (this.map_data[first + 2]).toString(16);
					if((this.map_data[start]).toString(16).length < 2) {
						output += '0' + (this.map_data[start]).toString(16);
					} else {
						output += (this.map_data[start]).toString(16);
					}
					start++;
					if((this.map_data[start]).toString(16).length < 2) {
						output += '0' + (this.map_data[start]).toString(16);
					} else {
						output += (this.map_data[start]).toString(16);
					}
					start++;
					if((this.map_data[start]).toString(16).length < 2) {
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
	},
	getStart: function() {
		for(var x = 0; x < this.level_map.width; x++) {
			for(var y = 0; y < this.level_map.height; y++) {
				if(this.colorAt(x,y) === specialBlocks['start']) {
					return({x: x, y: y});
				}
			}
		}
		return({x: 0, y: 0});
	},
	getEnd: function() {
		for(var x = 0; x < this.level_map.width; x++) {
			for(var y = 0; y < this.level_map.height; y++) {
				if(this.colorAt(x,y) === specialBlocks['end']) {
					return({x: x, y: y});
				}
			}
		}
		return({x: 0, y: 0});
	},
	draw: function() {
		var blockCount = 0;
		if(this.map_data !== null) {
			// precalculate max x value in map array
			var xDraw = Math.floor(this.xOffset / this.scale) + Math.floor(c.width / this.scale) + 1;
			var yDraw = Math.floor(this.yOffset / this.scale) + Math.floor(c.height / this.scale) + 1;
			for(var y = Math.floor(this.yOffset / this.scale); y < this.level_map.height; y++) {
				for(var x = Math.floor(this.xOffset / this.scale); x < xDraw; x++) {
					var thisColor = this.colorAt(x, y);
					if(thisColor !== specialBlocks['blank']) { // don't draw blank tiles
						// only draw if near canvas
						if((x * this.scale) - this.xOffset >= -this.scale && (x * this.scale) - this.xOffset <= c.width) {
							if((y * this.scale) - this.yOffset >= -this.scale && (y * this.scale) - this.yOffset <= c.height) {
								//TODO add bounds checking for yOffset too
								ctx.fillStyle = thisColor;
								ctx.fillRect((x * this.scale) - this.xOffset, (y * this.scale) - this.yOffset, this.scale, this.scale);
								if(input.debug) {
									console.log(blockCount + ': Drawing block (' + x + ', ' + y + ') with color ' + thisColor);
								}
								blockCount++;
							}
						}
					}
				}
			}						
		}
		if(input.debug) input.debug = false;
	},
	toMapCoord: function(point) {
		var p = {
			x: point.x.valueOf(),
			y: point.y.valueOf()
		}
		
		p.x = Math.floor((p.x + this.xOffset) / this.scale); // map is full length, so get that
		p.y = Math.floor((p.y + this.yOffset) / this.scale);
		
		// check in bounds
		if(p.x < 0 || p.x > this.level_map.width || p.y < 0 || p.y > this.level_map.height) {
			return null;
		} else {
			return p.valueOf();
		}
	},
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Level Debug:';
		debugOutput += '<table><tr><td>start</td><td>(' + this.xOffset.toFixed(2) + ', ' + this.yOffset.toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>map width</td><td>(' + this.mapWidth().toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>map height</td><td>(' + this.mapHeight().toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>scale</td><td>(' + this.scale.toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>scaleMinusOne</td><td>(' + this.scaleMinusOne.toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>gravity</td><td>(' + this.gravity.toFixed(2) + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	}	
}

// BEGIN ImageLoader Scripts
// ImageLoader based on http://www.html5rocks.com/en/tutorials/games/assetmanager/
function ImageLoader() {
	this.successCount = 0;
	this.errorCount = 0;
	this.downloadQueue = [];
	this.cache = {};
}

ImageLoader.prototype.queueDownload = function(path) {
	this.downloadQueue.push(path);
}

ImageLoader.prototype.downloadAll = function(downloadCallback) {
	if(this.downloadQueue.length === 0) {
		downloadCallback();
	} else {
		for(var i = 0; i < this.downloadQueue.length; i++) {
			var path = this.downloadQueue[i];
			var img = new Image();
			var that = this;
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

ImageLoader.prototype.isDone = function() {
	return(this.downloadQueue.length === (this.successCount + this.errorCount));
}

ImageLoader.prototype.getAsset = function(path) {
	return this.cache[path];
}
// END ImageLoader Scripts

// background class from canvasbg project http://www.github.com/databyss/canvasbg
function background() {
	this.image = null;
	this.scale = 1;
	this.scroll = {
		x: 0, y: 0
	};
	this.scrollFactor = {
		x: 1, y: 1
	};
	this.velocity = {
		x: 0, y: 0
	};
	this.gameWidth = function() {
		if(this.image === null) {
			return 0;
		}
		return (this.image.width * this.scale);
	};
	this.gameHeight = function() {
		if(this.image === null) {
			return 0;
		}
		return (this.image.height * this.scale);
	};
	this.update = function(ms) {
		this.scroll.x += this.velocity.x * (ms / 1000);
		this.scroll.y += this.velocity.y * (ms / 1000);
		if(this.scroll.x > this.gameWidth()) this.scroll.x = 0;
		if(this.scroll.x < 0) this.scroll.x = this.gameWidth() - 1;
		
		if(this.scroll.y > this.gameHeight()) this.scroll.y = 0;
		if(this.scroll.y < 0) this.scroll.y = this.gameHeight() - 1;
	};
	this.draw = function(gameWorld, clearScreen) {
		if(clearScreen) {
			ctx.clearRect(0, 0, c.width, c.height);
		}
		if(this.image !== null) {
			var xPoint = this.scroll.x - ((gameWorld.xOffset * this.scrollFactor.x) % this.gameWidth()) - (this.gameWidth() * 2); // replace by scroll and scrollFactor
			var yPoint = this.scroll.y - ((gameWorld.yOffset * this.scrollFactor.y) % this.gameHeight()) - (this.gameHeight() * 2);
			
			while(xPoint < c.width) {
				while(yPoint < c.height) {
					//TODO: if image is too big, only draw to edge of canvas
					ctx.drawImage(this.image, xPoint, yPoint, this.gameWidth(), this.gameHeight());
					yPoint += this.gameHeight();
				}
				yPoint = this.scroll.y - ((gameWorld.yOffset * this.scrollFactor.y) % this.gameHeight()) - (this.gameHeight() * 2);
				xPoint += this.gameWidth();
			}
			//console.log('finished drawing bg1');
		}
	}
}
// END background class