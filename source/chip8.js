/**
 * @author      Francisco Santos Belmonte <fjsantosb@gmail.com>
 * @copyright   2016
 */

Chip8 = function () {
	var hex = [0xf0, 0x90, 0x90, 0x90, 0xf0,
		0x20, 0x60, 0x20, 0x20, 0x70,
		0xf0, 0x10, 0xf0, 0x80, 0xf0,
		0xf0, 0x10, 0xf0, 0x10, 0xf0,
		0x90, 0x90, 0xf0, 0x10, 0x10,
		0xf0, 0x80, 0xf0, 0x10, 0xf0,
		0xf0, 0x80, 0xf0, 0x90, 0xf0,
		0xf0, 0x10, 0x20, 0x40, 0x40,
		0xf0, 0x90, 0xf0, 0x90, 0xf0,
		0xf0, 0x90, 0xf0, 0x10, 0xf0,
		0xf0, 0x90, 0xf0, 0x90, 0x90,
		0xe0, 0x90, 0xe0, 0x90, 0xe0,
		0xf0, 0x80, 0x80, 0x80, 0xf0,
		0xe0, 0x90, 0x90, 0x90, 0xe0,
		0xf0, 0x80, 0xf0, 0x80, 0xf0,
		0xf0, 0x80, 0xf0, 0x80, 0x80];
	this.v = new Array(0x0f);
	for (var i = 0; i < this.v.length; i++) {
		this.v[i] = 0x00;
	}
	this.i = 0x00;
	this.sp = new Array();
	this.pc = 0x200;
	this.delay = 0x00;
	this.sound = 0x00;
	this.memory = new Array(0x1000);
	for (var i = 0; i < hex.length; i++) {
		this.memory[i] = hex[i];
	}
	for (var i = hex.length; i < this.memory.length; i++) {
		this.memory[i] = 0x00;
	}
	this.input = new Input();
	this.screen = new Screen('emulator', 10);
	this.display = new Array(0x40 * 0x20);
	for (var i = 0; i < this.display.length; i++) {
		this.display[i] = 0x00;
	}
	this.key = [0x58, 0x31, 0x32, 0x33, 0x51, 0x57, 0x45, 0x41, 0x53, 0x44, 0x5a, 0x43, 0x34, 0x52, 0x46, 0x56];
};

Chip8.prototype = {
	loadRom: function (file) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', file, false);
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.send(null);
		for(var i = 0; i < xhr.responseText.length; ++i) {
			chip8.memory[0x200 + i] = xhr.responseText.charCodeAt(i) & 0xff; 
		}
	},
	execute: function () {
		var opcode1 = this.memory[this.pc];
		var opcode2 = this.memory[this.pc + 1];
		var nib1 = opcode1 >> 4;
		var nib2 = opcode1 & 0x0f;
		var nib3 = opcode2 >> 4;
		var nib4 = opcode2 & 0x0f;
		if (this.delay > 0) {
			this.delay--;
		}
		if (this.sound > 0) {
			this.sound--;
		}
		switch (nib1) {
			case 0x00:
				switch (nib2) {
					case 0x00:
						switch (nib3) {
							case 0x0e:
								switch (nib4) {
									case 0x00:
										this.screen.clear();
										for(var i = 0; i < this.display.length; i++) {
											this.display[i] = 0;
										}
										this.pc += 2;
									break;
									case 0x0e:
										this.pc = this.sp.pop();
									break;
								}
							break;
						}
					break;
				}
			break;
			case 0x01:
				this.pc = (nib2 << 8) + (nib3 << 4) + nib4;
			break;
			case 0x02:
				this.pc += 0x02;
				this.sp.push(this.pc);
				this.pc = (nib2 << 8) + (nib3 << 4) + nib4;
			break;
			case 0x03:
				if (this.v[nib2] === opcode2) {
					this.pc += 4;
				} else {
					this.pc += 2;
				}
			break;
			case 0x04:
				if (this.v[nib2] !== opcode2) {
					this.pc += 4;
				} else {
					this.pc += 2;
				}
			break;
			case 0x05:
				switch (nib4) {
					case 0x00:
						if (this.v[nib2] === this.v[nib3]) {
							this.pc += 4;
						} else {
							this.pc += 2;
						}
					break;
				}
			break;
			case 0x06:
				this.v[nib2] = opcode2;
				this.pc += 2;
			break;
			case 0x07:
				if ((this.v[nib2] + opcode2) > 0xff) {
					this.v[nib2] += (opcode2 - 0x100);
				} else {
					this.v[nib2] += opcode2;
				}
				this.pc += 2;
			break;
			case 0x08:
				switch (nib4) {
					case 0x00:
						this.v[nib2] = this.v[nib3];
						this.pc += 2;
					break;
					case 0x01:
						this.v[nib2] |= this.v[nib3];
						this.pc += 2;
					break;
					case 0x02:
						this.v[nib2] &= this.v[nib3];
						this.pc += 2;
					break;
					case 0x03:
						this.v[nib2] ^= this.v[nib3];
						this.pc += 2;
					break;
					case 0x04:
						if ((this.v[nib2] + this.v[nib3]) > 0xff) {
							this.v[nib2] += (this.v[nib3] - 0x100);
							this.v[0x0f] = 1;
						} else {
							this.v[nib2] += this.v[nib3];
							this.v[0x0f] = 0;
						}
						this.pc += 2;
					break;
					case 0x05:
						if ((this.v[nib2] - this.v[nib3]) < 0x00) {
							this.v[nib2] -= (this.v[nib3] + 0x100);
							this.v[0x0f] = 0;
						} else {
							this.v[nib2] -= this.v[nib3];
							this.v[0x0f] = 1;
						}
						this.pc += 2;
					break;
					case 0x06:
						this.v[0x0f] = (this.v[nib2] & 0x01);
						this.v[nib2] >>= 0x01;
						this.pc += 2;
					break;
					case 0x07:
						if (this.v[nib3] - this.v[nib2] < 0) {
							this.v[nib2] = (this.v[nib3] - this.v[nib2] + 0x100);
							this.v[0x0f] = 0;
						} else {
							this.v[nib2] = (this.v[nib3] - this.v[nib2]);
							this.v[0x0f] = 1;
						}
						this.pc += 2;
					break;
					case 0x0e:
						this.v[0x0f] = (this.v[nib2] & 0x80);
						this.v[nib2] <<= 0x01;
						if (this.v[nib2] > 0xff) {
							this.v[nib2] -= 0x100;
						}
						this.pc += 2;
					break;
				}
			break;
			case 0x09:
				switch (nib4) {
					case 0x00:
						if (this.v[nib2] !== this.v[nib3]) {
							this.pc += 4;
						} else {
							this.pc += 2;
						}
					break;
				}
			break;
			case 0x0a:
				this.i = (nib2 << 8) + (nib3 << 4) + nib4;
				this.pc += 2;
			break;
			case 0x0b:
				this.pc = ((nib2 << 8) + (nib3 << 4) + nib4) + this.v[0x00]; 
			break;
			case 0x0c:
				this.v[nib2] = Math.floor(Math.random() * (0xff)) & opcode2;
				this.pc += 2;
			break;
			case 0x0d:
				this.v[0x0f] = 0x00;
				for (var i = 0; i < nib4; i++) {
					for (var j = 0; j < 8; j++) {
						var x = this.v[nib2] + 7 - j;
						var y = this.v[nib3] + i;
						if ((this.memory[this.i + i] & Math.pow(2, j)) !== 0) {
							if ((0x01 ^ this.display[x + (y * 0x40)]) === 0) {
								this.v[0x0f] = 0x01;
								this.display[x + (y * 0x40)] = 0x00;
							} else {
								this.display[x + (y * 0x40)] = 0x01;
							}
						}
					}
				}
				this.screen.dump(this.display, 0x40, 0x20);
				this.pc += 2;
			break;
			case 0x0e:
				switch (nib3) {
					case 0x09:
						switch (nib4) {
							case 0x0e:
								if (this.input.key === this.key[this.v[nib2]]) {
									this.pc += 4;
								} else {
									this.pc += 2;
								}
							break;
						}
					break;
					case 0x0a:
						switch (nib4) {
							case 0x01:
								if (this.input.key !== this.key[this.v[nib2]]) {
									this.pc += 4;
								} else {
									this.pc += 2;
								}
							break;
						}
					break;
				}
			break;
			case 0x0f:
				switch (nib3) {
					case 0x00:
						switch (nib4) {
							case 0x07:
								this.v[nib2] = this.delay;
								this.pc += 2;
							break;
							case 0x0a:
								var key = 0;
								var i = 0;
								while (!key && i < this.key.length) {
									if (this.input.key === this.key[i]) {
										key = i;
									} else {
										i++;
									}
								}
								if (key !== 0) {
									this.v[nib2] = key;
									this.pc += 2;
								}
							break;
						}
					break;
					case 0x01:
						switch (nib4) {
							case 0x05:
								this.delay = this.v[nib2];
								this.pc += 2;
							break;
							case 0x08:
								this.sound = this.v[nib2];
								this.pc += 2;
							break;
							case 0x0e:
								this.i += this.v[nib2];
								this.pc += 2;
							break;
						}
					case 0x02:
						switch (nib4) {
							case 0x09:
								this.i = this.v[nib2] * 5;
								this.pc += 2;
							break;
						}
					break;
					case 0x03:
						switch (nib4) {
							case 0x03:
								this.memory[this.i] = Math.floor(this.v[nib2] / 100);
								this.memory[this.i + 1] = Math.floor((this.v[nib2] % 100) / 10);
								this.memory[this.i + 2] = (this.v[nib2] % 100) % 10;
								this.pc += 2;
							break;
						}
					break;
					case 0x05:
						switch (nib4) {
							case 0x05:
								for (var i = 0; i <= nib2; i++) {
									this.memory[this.i + i] = this.v[i];
								}
								this.pc += 2;
							break;
						}
					break;
					case 0x06:
						switch (nib4) {
							case 0x05:
								for (var i = 0; i <= nib2; i++) {
									this.v[i] = this.memory[this.i + i];
								}
								this.pc += 2;
							break;
						}
					break;
				}
			break;
		}
	}
};