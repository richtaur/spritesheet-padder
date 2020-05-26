#!/usr/local/bin/node

const fs = require("fs");
const PNG = require("pngjs").PNG;

const config = {
	inputPNG: "input.png",
	outputPNG: "output.png",
	tilesize: 256,
	padding: 2,
};

// const pngs = [];
const stream = [];

/*
function addPNGAt (source, dest, targetX, targetY) {
	for (let y = 0; y < source.height; y++) {
		for (let x = 0; x < source.width; x++) {
			const idx = (source.width * y + x) << 2;
			const index = (dest.width * (y + targetY) + (x + targetX));
			dest.data[index] = source[idx];
		}
	}
}
*/

console.log("reading " + config.inputPNG + " ...");
fs.createReadStream(config.inputPNG)
.pipe(new PNG())
.on("parsed", function () {
	// First loop through and collect pixel data
	for (let ty = 0; ty < this.height - config.tilesize; ty += config.tilesize) {
		for (let tx = 0; tx < this.width - config.tilesize; tx += config.tilesize) {
			/*
			this.data[idx] = 255 - this.data[idx];
			this.data[idx+1] = 255 - this.data[idx+1];
			this.data[idx+2] = 255 - this.data[idx+2];

			// and reduce opacity
			this.data[idx+3] = this.data[idx+3] >> 1;
			*/

			const png = new PNG({
				width: config.tilesize,
				height: config.tilesize,
			});
			for (let y = 0; y < config.tilesize; y++) {
				for (let x = 0; x < this.width - config.tilesize; x++) {
					const dx = tx + x;
					const dy = ty + y;
					const dataIndex = (this.width * dy + dx) << 2;
					for (let i = 0; i < 4; i++) {
						stream[dataIndex + i] = this.data[dataIndex + i];
					}
				}
			}

			/*
			for (let i = 0; i < config.tilesize * 4; i++) {
				png.data[i] = this.data[dataIndex + i];
				// stream.push(this.data[dataIndex + i]);
				stream[dataIndex + i] = this.data[dataIndex + i];
			}
			// pngs.push(png);
			*/
		}
	}

	// Resize our new png
	const streamWidth = this.width;
	const streamHeight = this.height;
	/*
	const cols = this.width / config.tilesize;
	const rows = this.height / config.tilesize;
	this.width = cols * (config.tilesize + config.padding);
	this.height = rows * (config.tilesize + config.padding);
	*/

	// Clear the pixel data
	/*
	for (let i = 0; i < this.width * this.height * 4; i++) {
		this.data[i] = 0;
	}
	*/

	const sourceX = 7 * 256;
	const sourceY = 1 * 256;
	const destX = 128;
	const destY = 128;
	for (let y = 0; y < config.tilesize; y++) {
		for (let x = 0; x < config.tilesize; x++) {
			const dx = destX + x;
			const dy = destY + y;
			const dataIndex = (this.width * dy + dx) << 2;

			const sx = sourceX + x;
			const sy = sourceY + y;
			const streamIndex = (streamWidth * sy + sx) << 2;
			for (let i = 0; i < 4; i++) {
				this.data[dataIndex + i] = stream[streamIndex + i];
			}
		}
	}

	/*
	// Render the pngs ...
	let x = config.padding;
	let y = config.padding;
	pngs.forEach(function (png) {
		addPNGAt(png, this, x, y);
	}.bind(this));
	*/

	console.log("writing ...");
	this.pack().pipe(fs.createWriteStream(config.outputPNG));
	console.log("done! wrote " + config.outputPNG);
});
