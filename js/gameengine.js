require(['background']);
require(['level']);
require(['player']);
require(['imageloader']);

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

function GameEngine(c, ctx) {
	"use strict";
	this.c = c;
	this.ctx = ctx;
	this.exitFlag = false;
	this.pauseFlag = true;
	this.levels = [];
	this.backgrounds = [];
	this.player = new Player(this.c, this.ctx);
	this.currentLevel = 0;
	this.levelTimer = 0;
	this.countdown = 3000;
	
	this.states = ['mainMenu', 'aboutPage', 'gameRunning', 'gamePaused'];
}

GameEngine.prototype.addBackground = function (background, scale, scroll, velocity) {
	var tempBG = new Background(this.c, this.ctx);

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

GameEngine.prototype.addLevel = function (levelMap) {
	var levelID = this.levels.length;
	
	this.levels.push(new Level(this.c, this.ctx));
	// load level image map
	this.levels[levelID].level_map = levelMap;
	
	// save current context configuration
	this.ctx.save()
	// undo translations so image loading is normal
	this.ctx.translate(0, this.c.height);
	this.ctx.scale(1, -1);
	this.ctx.translate(-0.5, 0.5); // offset for aliasing

	// draw map for grabbing data
	this.ctx.drawImage(this.levels[levelID].level_map, 0, 0);
	// load image into map data
	this.levels[levelID].map_data = this.ctx.getImageData(0, 0, this.levels[levelID].level_map.width, this.levels[levelID].level_map.height).data;
	// clear level map
	this.ctx.clearRect(0, 0, this.c.width, this.c.height);
	
	// restore context
	this.ctx.restore();		
};

GameEngine.prototype.nextLevel = function () {
	this.currentLevel += 1;
	if (this.currentLevel >= this.levels.length) {
		this.currentLevel = 0;
	}
	this.resetLevel();
};

GameEngine.prototype.prevLevel = function () {
	this.currentLevel -= 1;
	if (this.currentLevel < 0) {
		this.currentLevel = this.levels.length - 1;
	}
	this.resetLevel();
};

GameEngine.prototype.resetLevel = function () {
	var temp = this.levels[this.currentLevel].getStart();
	
	this.player.pos.x = temp.x * this.levels[this.currentLevel].scale;
	this.player.pos.y = temp.y * this.levels[this.currentLevel].scale;
	this.player.vel.x = 0;
	this.player.vel.y = 0;
	this.levelTimer = 0;
	this.pauseFlag = true;
	this.player.update(0, this.levels[this.currentLevel], input, this);
	this.countdown = 1000; // 1 second for restart
}

GameEngine.prototype.update = function (ms) {
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

GameEngine.prototype.draw = function () {
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
	this.drawTimer(this.c, this.ctx);
	
	// if paused, show pause flag
	if (this.pauseFlag === true) {
		// set font properties
		this.ctx.fillStyle = '#ff0000';
		this.ctx.font = '48px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		
		// save current context configuration
		this.ctx.save()
		// undo translations so text appears normal
		this.ctx.translate(0, this.c.height);
		this.ctx.scale(1, -1);
		
		// draw text
		if (this.countdown > 0) {
			this.ctx.fillText((this.countdown / 1000).toFixed(1), this.c.width / 2, this.c.height / 2);
		} else {
			this.ctx.fillText('PAUSED!', this.c.width / 2, this.c.height / 2);
		}
		
		// restore context
		this.ctx.restore();
	}
};

GameEngine.prototype.drawTimer = function (c, ctx) {
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
	this.ctx.fillStyle = '#ff0000';
	this.ctx.font = '30px sans-serif';
	this.ctx.textAlign = 'right';
	this.ctx.textBaseline = 'bottom';
	
	// save current context configuration
	this.ctx.save()
	// undo translations so text appears normal
	this.ctx.translate(0, c.height);
	this.ctx.scale(1, -1);
	
	// draw text
	this.ctx.fillText(min + ':' + sec, this.c.width - 10, 40);
	
	// restore context
	this.ctx.restore();
};