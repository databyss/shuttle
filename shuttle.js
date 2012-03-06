var exitFlag = false;
var lastUpdate = null;
var bgImage = null;
var c, ctx;
var imageManager = new ImageLoader();

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
	pos: { // player position
		x: 50,
		y: 120
	},
	vel: { // player velocity
		x: 0, y: 0 
	},
	color: '#ffffff',
	thrust: 10,
	sideThrust: 5,
	gravity: 10,
	image: null,
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Player Debug:';
		debugOutput += '<table><tr><td>pos</td><td>(' + this.pos.x.toFixed(2) + ', ' + this.pos.y.toFixed(2) + ')</td></tr>';
		debugOutput += '<tr><td>vel</td><td>(' + this.vel.x.toFixed(2) + ', ' + this.vel.y.toFixed(2) + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	},
	update: function(ms) {
		this.debugOutput();
		// ms is milliseconds since last input
		var msDiff = ms / 1000; // multiplicative factor to handle delays > 1 second

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
		if(this.pos.x + this.width >= c.width) {
			this.pos.x = c.width - this.width;
			this.vel.x = 0;
		}

		this.pos.y += this.vel.y;
				
		if(this.pos.y < 0) {
			this.pos.y = 0;
			this.vel.y = 0;
			
			// hit floor, kill left/right momentum
			this.vel.x = 0;
		}
		if(this.pos.y + this.height > c.height) {
			this.pos.y = c.height - this.height;
			this.vel.y = 0;
		}
		
	},
	draw: function() {
		// draw player
		//ctx.fillStyle = this.color;
		//ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if(player.image !== null) {
			ctx.drawImage(this.image, this.pos.x, this.pos.y);
		}
	}
}

function setMapBG() {
	// get canvas context				
	//ctx.clearRect(0, 0, c.width, c.height);
	//ctx.fillStyle = '#ffffff';
	//ctx.fillRect(0, 0, c.width, c.height);
	if(bgImage !== null) {
		ctx.drawImage(bgImage, 0, 0, 400, 400);
	}
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
		drawDebugGrid(); // 'crosshair' or 'grid'
		player.draw();
		if(!lastUpdate) {
			lastUpdate = newUpdate;
		}
		player.update(newUpdate - lastUpdate); // passing in gravity
	} else {
		//player.debugOutput();
	}
	lastUpdate = newUpdate;				 	
}

function loadImages() {
	// preload images	
	imageManager.queueDownload('images/tardis1.png');
	imageManager.queueDownload('images/spacebg400x400.png');
	
	imageManager.downloadAll(function() {
		bgImage = imageManager.getAsset('images/spacebg400x400.png');
		player.image = imageManager.getAsset('images/tardis1.png');
		player.width = player.image.width;
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
 
 
    // usage: 
    // instead of setInterval(render, 16) ....
 
    //(function animloop(){
    //  requestAnimFrame(animloop);
    //  render();
    //})();
    // place the rAF *before* the render() to assure as close to 
    // 60fps with the setTimeout fallback.
// END RAF SHIM

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