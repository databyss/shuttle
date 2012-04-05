define(['imageloader', 'background', 'level', 'player', 'gameengine'], function() {
	var lastUpdate = null;
	var engine = null;
	var c, ctx;
	
	// Article: http://www.wired.com/gamelife/2012/03/rj-mical-gdc-speech
	
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
	
	function gameLoop() {
		"use strict";
		var timeChange, newUpdate, i;
	
		newUpdate = new Date();
		if (!lastUpdate) {
			lastUpdate = newUpdate;
		}
	
		timeChange = newUpdate - lastUpdate;
	
		// update engine
		engine.update(timeChange);
	
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
			engine.addBackground(imageManager.getAsset('images/spacebg64x64.png'), 2, {x: 0.25, y: 0.25}); // image, scale, scrollFactor, velocity
			engine.addBackground(imageManager.getAsset('images/bgstars.png'), 1, {x: 0.5, y: 0.5}, {x: -50, y: 0});
	
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

		// on ready
		setupCanvas();

		engine = new GameEngine(c, ctx);

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

			console.log('Click Debug:');
			console.log('click:  (' + e.pageX + ', ' + e.pageY + ')');
			console.log('canvas: (' + Math.round(x) + ', ' + Math.round(y) + ')');
			console.log('game:   (' + Math.round(x) + ', ' + (c.height - Math.round(y)) + ')');
			console.log('map:    (' + Math.round(map.x) + ', ' + Math.round(map.y) + ')');
			console.log('color:  (' + engine.levels[engine.currentLevel].colorAt(map.x, map.y) + ')');
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

});
