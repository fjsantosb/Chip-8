/**
 * @author	Francisco Santos Belmonte <fjsantosb@gmail.com>
 */

var chip8 = new Chip8();

chip8.loadRom('roms/kaleid.bin');

var main = function () {
	for (var i = 0; i < 3; i++) {
		chip8.execute();
	}
	window.requestAnimationFrame(main);
};

window.requestAnimationFrame(main);
