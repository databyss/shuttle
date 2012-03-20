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
