/**
 * @author      Francisco Santos Belmonte <fjsantosb@gmail.com>
 * @copyright   2016
 */

Input = function () {
    this.key = 0;
    window.onkeydown = (function (e) {
        this.keyDown(e);
    }).bind(this);
    window.onkeyup = (function (e) {
        this.keyUp(e);
    }).bind(this);
};

Input.prototype = {
    keyDown: function (e) {
        e.preventDefault();
        this.key = e.keyCode;
    },
    keyUp: function (e) {
        e.preventDefault();
        this.key = 0;
    }
};