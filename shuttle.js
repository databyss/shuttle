var exitFlag = false;
var lastUpdate = null;
var bgImage = null;
var c, ctx;

// Article: http://www.wired.com/gamelife/2012/03/rj-mical-gdc-speech

var clickDebug =  'Click Debug:';
clickDebug += '<table><tr><td>click</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>canvas</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>game</td><td>(0,0)</td></tr></table>';

var inputKeys = { // defines key codes used for input
	up: 87, // W
	right: 68, // D
	left: 65, // A
	quit: 27 // ESC
}
	
// input state object
var input = {
	left: false,
	up: false,
	right: false,
	quit: false,
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Input Debug:';
		debugOutput += '<table><tr><td>up</td><td>(' + this.up + ')</td></tr>';
		debugOutput += '<tr><td>left</td><td>(' + this.left + ')</td></tr>';
		debugOutput += '<tr><td>right</td><td>(' + this.right + ')</td></tr>';
		debugOutput += '<tr><td>quit</td><td>(' + this.quit + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	}	
}

var player = {
	width: 10,
	height: 20,
	drawWidth: 34,
	drawHeight: 50,
	pos: { // player position
		x: 50,
		y: 120
	},
	vel: { // player velocity
		x: 0, y: 0 
	},
	color: '#ffffff',
	thrust: 7,
	sideThrust: 7,
	gravity: 7,
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
		
		this.pos.x += this.vel.x;
		
		// check left edge of map
		if(this.pos.x < 0) {
			this.pos.x = 0;
			this.vel.x = 0;
		}
		// check the right edge of the map
		if(this.pos.x + this.drawWidth >= bgImage.width) {
			this.pos.x = bgImage.width - this.drawWidth;
			this.vel.x = 0;
		}

		this.pos.y += this.vel.y;
				
		if(this.pos.y < 0) {
			// display landing force
			//console.log('Landed with a force of ' + calcLandingForce() + 'N');
			this.pos.y = 0;
			this.vel.y = 0;
			
			// hit floor, kill left/right momentum
			this.vel.x = 0;
		}
		if(this.pos.y + this.drawHeight > bgImage.height) {
			this.pos.y = bgImage.height - this.drawHeight;
			this.vel.y = 0;
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
		if(level.xOffset > bgImage.width - c.width) {
			level.xOffset = bgImage.width - c.width;
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
		if(level.yOffset > bgImage.height - c.height) {
			level.yOffset = bgImage.height - c.height;
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

function setMapBG() {
	// get canvas context				
	//ctx.clearRect(0, 0, c.width, c.height);
	//ctx.fillStyle = '#ffffff';
	//ctx.fillRect(0, 0, c.width, c.height);
	if(bgImage !== null) {
		ctx.drawImage(bgImage, level.xOffset, level.yOffset, c.width, c.height, 0, 0, c.width, c.height);
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
		
		defult:
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
		
		defult:
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
					
	$('#gameDebug').html(clickDebug);		
	input.debugOutput();
	if(!exitFlag) {
		setMapBG();
		level.draw();
		drawDebugGrid(); // 'crosshair' or 'grid'
		player.draw();
		if(!lastUpdate) {
			lastUpdate = newUpdate;
		}
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
	imageManager.queueDownload('images/space.png');
	
	imageManager.downloadAll(function() {
		bgImage = imageManager.getAsset('images/space.png');
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

	// flip image and translate down to fix coordinates
	ctx.scale(1, -1); // flip over x axis
	ctx.translate(0, -c.height); // move (0,0) to bottom left to match cartisian plane 
	ctx.translate(0.5, 0.5); // offset for aliasing
}

$(function() {
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
	    
		clickDebug =  'Click Debug:';
		clickDebug += '<table><tr><td>click</td><td>(' + e.pageX + ', ' + e.pageY + ')</td></tr>';
		clickDebug += '<tr><td>canvas</td><td>(' + Math.round(x) + ', ' + Math.round(y) + ')</td></tr>';
		clickDebug += '<tr><td>game</td><td>(' + Math.round(x) + ', ' + (c.height - Math.round(y)) + ')</td></tr></table>';
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

// color array for drawing blocks
var colors = ['#ffffff', '#00ff00', '#ff0000', '#0000ff'];

var level = {
	level_map: null,
	map_data: null,
	map: [ // map is inverted so that negative indexes are always down and to the left
			[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
			[3,1,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3],
			[0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
		],
	xOffset: 0,
	yOffset: 0,
	scale: 40,
	scaleMinusOne: 39,
	gravity: 7,
	mapWidth: function() {
		return(this.map[0].length * this.scale);
	},
	mapHeight: function() {
		return(this.map.length * this.scale);
	},
	colorAt: function(x, y) {
		if(this.map_data !== null) {
			if(x < 0 || y < 0 || x >= this.level_map.width || y >= this.level_map.height) {
				var first = (y * this.level_map.width * 4) + (x * 4); // 4 elements per pixel RGBA
				try {
					var output = '#' + (this.map_data[first]).toString(16) + (this.map_data[first + 1]).toString(16) + (this.map_data[first + 2]).toString(16);
				} catch (e) {
					console.log('Error getting map_data for (' + x + ', ' + y + ')');					
				}
				return output;
			}
		}
		return null;
	},
	draw: function() {
		if(this.map_data !== null) {
			for(var y = 0; y < this.level_map.height; y++) {
				for(var x = 0; x < this.level_map.width; x++) {
					if(this.colorAt !== '#000000') { // don't draw blank tiles
						// only draw if near canvas
						if((x * this.scale) - this.xOffset >= -this.scale && (x * this.scale) - this.xOffset <= c.width) {
							//TODO add bounds checking for yOffset too
							ctx.fillStyle  = this.colorAt(x,y);
							ctx.fillRect((x * this.scale) - this.xOffset, (y * this.scale) - this.yOffset, this.scaleMinusOne, this.scaleMinusOne);
						}
					}
				}
			}						
		}
	},
	toMapCoord: function(point) {
		var p = {
			x: point.x.valueOf(),
			y: point.y.valueOf()
		}
		
		p.x = Math.floor((p.x + this.xOffset) / this.scale); // map is full length, so get that
		p.y = Math.floor((p.y + this.yOffset) / this.scale);
		
		// check in bounds
		if(p.x < 0 || p.x >= this.map[0].length || p.y < 0 || p.y >= this.map.length) {
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