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