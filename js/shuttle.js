define(['imageloader', 'background', 'level', 'player'], function() {
	var lastUpdate = null;
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
	
		$('#gameDebug').html(clickDebug);
	
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

		engine = new GameEngine();

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
	
	// BEGIN GameEngine
	function GameEngine() {
		"use strict";
		this.exitFlag = false;
		this.pauseFlag = true;
		this.levels = [];
		this.backgrounds = [];
		this.player = new Player(c, ctx);
		this.currentLevel = 0;
		this.levelTimer = 0;
		this.countdown = 3000;
		this.addBackground = function (background, scale, scroll, velocity) {
			var tempBG = new Background(c, ctx);
	
			tempBG.image = background;
			if (scale === undefined) {
				tempBG.scale = 1;
			} else {
				tempBG.scale = scale;
			}
	
			if (scroll === undefined) {
				tempBG.scrollFactor.x = 1;
				tempBG.scrollFactor.y = 1;
			} else {
				tempBG.scrollFactor.x = scroll.x;
				tempBG.scrollFactor.y = scroll.y;
			}
			
			if (velocity === undefined) {
				tempBG.velocity.x = 0;
				tempBG.velocity.y = 0;
			} else {
				tempBG.velocity.x = velocity.x;
				tempBG.velocity.y = velocity.y;
			}
			
			this.backgrounds.push(tempBG);
		};
		this.addLevel = function (levelMap) {
			var levelID = this.levels.length;
			
			this.levels.push(new Level(c, ctx));
			// load level image map
			this.levels[levelID].level_map = levelMap;
			
			// save current context configuration
			ctx.save()
			// undo translations so image loading is normal
			ctx.translate(0, c.height);
			ctx.scale(1, -1);
			ctx.translate(-0.5, 0.5); // offset for aliasing
	
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
			var temp = this.levels[this.currentLevel].getStart();
			
			this.player.pos.x = temp.x * this.levels[engine.currentLevel].scale;
			this.player.pos.y = temp.y * this.levels[engine.currentLevel].scale;
			this.player.vel.x = 0;
			this.player.vel.y = 0;
			this.levelTimer = 0;
			this.pauseFlag = true;
			this.player.update(0, this.levels[engine.currentLevel], input, this);
			this.countdown = 1000; // 1 second for restart
		}
		this.update = function (ms) {
			if (!this.pauseFlag) {
				
				this.levelTimer += ms;
				
				for (var i = 0; i < this.backgrounds.length; i += 1) {
					this.backgrounds[i].update(ms);
				}
				
				this.player.update(ms, this.levels[this.currentLevel], input, this);
				
			}
			if (this.countdown > 0) {
				this.countdown -= ms;
				if (this.countdown < 0) {
					this.countdown = 0;
					if (this.pauseFlag) {
						this.pauseFlag = false;
					}
				}
			}
		};
		this.draw = function () {
			// draw background
			for (var i = 0; i < this.backgrounds.length; i += 1) {
				if (this.backgrounds[i] !== null) {
					if (i === 0) {
						// clear bg on first one
						this.backgrounds[i].draw(this.levels[this.currentLevel], true);
					} else {
						this.backgrounds[i].draw(this.levels[this.currentLevel], false);
					}
				}
			}
	
			// draw level
			if(this.levels.length > 0) {
				this.levels[this.currentLevel].draw();
			}
			
			// draw player
			this.player.draw(this.levels[this.currentLevel]);
			
			// draw timer
			this.drawTimer(c, ctx);
			
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
				if (this.countdown > 0) {
					ctx.fillText((this.countdown / 1000).toFixed(1), c.width / 2, c.height / 2);
				} else {
					ctx.fillText('PAUSED!', c.width / 2, c.height / 2);
				}
				
				// restore context
				ctx.restore();
			}
		};
		this.drawTimer = function (c, ctx) {
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
});
