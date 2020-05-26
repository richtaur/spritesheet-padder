#!/usr/local/bin/node

const fs = require("fs");
const PNG = require("pngjs").PNG;

const config = {
	inputPNG: "input.png",
	outputPNG: "output.png",
	tilesize: 256,
	pad: 2,
	extrude: 1,
};

const stream = [];

console.log("reading " + config.inputPNG + " ...");
fs.createReadStream(config.inputPNG)
.pipe(new PNG())
.on("parsed", function () {
	// First loop through and collect pixel data
	for (let ty = 0; ty < this.height - config.tilesize; ty += config.tilesize) {
		for (let tx = 0; tx < this.width - config.tilesize; tx += config.tilesize) {
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
		}
	}

	// Resize our new png
	const streamWidth = this.width;
	const streamHeight = this.height;
	const cols = this.width / config.tilesize;
	const rows = this.height / config.tilesize;
	this.width = cols * (config.tilesize + config.pad) + config.pad;
	this.height = rows * (config.tilesize + config.pad) + config.pad;

	// Clear the pixel data
	for (let i = 0; i < this.width * this.height * 4; i++) {
		this.data[i] = 0;
	}

	function renderTile (png, sourceX, sourceY, destX, destY) {
		for (let y = 0; y < config.tilesize; y++) {
			for (let x = 0; x < config.tilesize; x++) {
				const dx = destX + x;
				const dy = destY + y;
				const dataIndex = (png.width * dy + dx) << 2;

				const sx = (sourceX * config.tilesize) + x;
				const sy = (sourceY * config.tilesize) + y;
				const streamIndex = (streamWidth * sy + sx) << 2;

				for (let i = 0; i < 4; i++) {
					png.data[dataIndex + i] = stream[streamIndex + i];
				}
			}
		}
	}

	// Render the tiles
	for (let sourceY = 0; sourceY < rows; sourceY++) {
		for (let sourceX = 0; sourceX < cols; sourceX++) {
			const destX = config.pad + sourceX * (config.tilesize + config.pad);
			const destY = config.pad + sourceY * (config.tilesize + config.pad);

			if (config.extrude > 0) {
				for (let y = -config.extrude; y <= config.extrude; y++) {
					for (let x = -config.extrude; x <= config.extrude; x++) {
						renderTile(this, sourceX, sourceY, destX + x, destY + y);
					}
				}
			}

			renderTile(this, sourceX, sourceY, destX, destY);
		}
	}

	console.log("writing ...");
	this.pack().pipe(fs.createWriteStream(config.outputPNG));
	console.log("done! wrote " + config.outputPNG);
});
