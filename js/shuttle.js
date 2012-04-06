define(['imageloader', 'player', 'level', 'gameengine', 'button'], function() {
	
	var lastUpdate = null;
	var engine = null;
	var c, ctx;
	var buttons = [];
	var isMouseDown = false;
	
	// Article: http://www.wired.com/gamelife/2012/03/rj-mical-gdc-speech
	function handleMouseMove(evt) {
		"use strict";
		if(isMouseDown === true) {
			// only care if button is down
			var gc, x, y;
			gc = $("#gameCanvas");
			x = evt.pageX - gc.offset().left;
			y = evt.pageY - gc.offset().top;
			if (evt.target.id === 'gameCanvas') {
				for(var i = 0; i < buttons.length; i++) {
					if (buttons[i].isInside({x: x, y: (c.height - y)})) {
						buttons[i].touch();
					} else if(buttons[i].isDown) {
						buttons[i].untouch();
					}
				}	
			}
		}
	}
	
	function handleMouseDown(evt) {
		"use strict";
		isMouseDown = true;
		var gc, x, y;
		gc = $("#gameCanvas");
		x = evt.pageX - gc.offset().left;
		y = evt.pageY - gc.offset().top;
		if (evt.target.id === 'gameCanvas') {
			for(var i = 0; i < buttons.length; i++) {
				if (buttons[i].isInside({x: x, y: (c.height - y)})) {
					buttons[i].touch();
				} else if(buttons[i].isDown) {
					buttons[i].untouch();
				}
			}	
		}
	}
	
	function handleMouseUp(evt) {
		"use strict";
		isMouseDown = false;
		var gc, x, y;
		gc = $("#gameCanvas");
		x = evt.pageX - gc.offset().left;
		y = evt.pageY - gc.offset().top;
		if (evt.target.id === 'gameCanvas') {
			for(var i = 0; i < buttons.length; i++) {
				if (buttons[i].isInside({x: x, y: (c.height - y)})) {
				} else if(buttons[i].isDown) {
					buttons[i].untouch();
				}
			}	
		}
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
	
		// draw buttons
		for(var i = 0; i < buttons.length; i++) {
			buttons[i].draw();
		}	
	
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
		imageManager.queueDownload('images/button_up.png');
		imageManager.queueDownload('images/button_down.png');
		imageManager.queueDownload('images/button_left.png');
		imageManager.queueDownload('images/button_right.png');
	
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
			
			var tempButton = new Button(c, ctx, 'left');
			tempButton.setImage(imageManager.getAsset('images/button_left.png'));
			tempButton.setPosition({ x: 50, y: 50 });
			tempButton.setScale(2);
			tempButton.alpha = 0.20;
			buttons.push(tempButton);
			
			tempButton = new Button(c, ctx, 'right');
			tempButton.setImage(imageManager.getAsset('images/button_right.png'));
			tempButton.setPosition({ x: 200, y: 50 });
			tempButton.setScale(2);
			tempButton.alpha = 0.20;
			buttons.push(tempButton);
			
			tempButton = new Button(c, ctx, 'up');
			tempButton.setImage(imageManager.getAsset('images/button_up.png'));
			tempButton.setPosition({ x: 350, y: 50 });
			tempButton.setScale(2);
			tempButton.alpha = 0.20;
			buttons.push(tempButton);
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
		window.addEventListener('mousemove', handleMouseMove, true);
	
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
