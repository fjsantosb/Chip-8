/**
 * @author      Francisco Santos Belmonte <fjsantosb@gmail.com>
 * @copyright   2016
 */

Screen = function (name, scale) {
    this.canvas = document.getElementById(name);
    this.context = this.canvas.getContext('2d');
    this.canvas.width *= scale;
    this.canvas.height *= scale;
    this.canvas.focus();
    this.context.scale(scale, scale);
    this.context.fillStyle = '#00ff00';
};

Screen.prototype = {
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    clearPixel: function (x, y) {
    	this.context.clearRect(x, y, 1, 1);
    },
    setPixel: function (x, y) {
    	this.context.fillRect(x, y, 1, 1);
    },
    dump: function (display, width, height) {
		for (var i = 0; i < width; i++) {
			for (var j = 0; j < height; j++) {
				if (display[i + (j * width)] === 1) {
					this.setPixel(i, j);
				} else {
					this.clearPixel(i, j);
				}
			}
		}
    }
};