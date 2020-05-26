#!/usr/local/bin/node

const fs = require("fs");
const PNG = require("pngjs").PNG;

const config = {
	input: "input.png",
	output: "output.png",
	tilesize: 256,
	pad: 4,
	extrude: 0,
};

function renderTile (source, sourceX, sourceY, dest, destX, destY) {
	for (let y = 0; y < config.tilesize; y++) {
		for (let x = 0; x < config.tilesize; x++) {
			// Calculate source index
			const sx = x + (sourceX * config.tilesize);
			const sy = y + (sourceY * config.tilesize);
			const sourceIndex = (source.width * sy + sx) << 2;

			// Calculate destination index
			const dx = x + destX;
			const dy = y + destY;
			const destIndex = (dest.width * dy + dx) << 2;

			// Apply RGBA data from source to destination
			for (let i = 0; i < 4; i++) {
				dest.data[destIndex + i] = source.data[sourceIndex + i];
			}

			// DEBUG: also draw it in the upper-left corner
			/*
			const ddx = x + (0 * config.tilesize);
			const ddy = y + (0 * config.tilesize);
			const di = (dest.width * ddy + ddx) << 2;
			for (let i = 0; i < 4; i++) {
				dest.data[di + i] = source.data[sourceIndex + i];
			}
			*/
		}
	}
}

console.log("> spritesheet-padder");
console.log("- reading " + config.input + " ...");
fs.createReadStream(config.input).pipe(new PNG()).on("parsed", function () {
	// Create a PNG to store the initial state of the sprite as a source
	const sourcePNG = new PNG({
		width: this.width,
		height: this.height,
	});

	// Analyze pixel data
	for (let i = 0; i < this.data.length; ++i) {
		sourcePNG.data[i] = this.data[i]; // Store pixel data in source
		this.data[i] = 0; // Reset pixel to transparent
	}

	// Resize to include padding
	const cols = this.width / config.tilesize;
	const rows = this.height / config.tilesize;
	const fullsize = config.tilesize + config.pad;
	console.log("- dimensions: " + this.width + "x" + this.height);
	this.width = config.pad + (cols * fullsize);
	this.height = config.pad + (rows * fullsize);
	console.log("- resized: " + this.width + "x" + this.height);

	// Render the tiles
	console.log("- rendering ...");
	for (let sourceY = 0; sourceY < rows; sourceY++) {
		for (let sourceX = 0; sourceX < cols; sourceX++) {
			const destX = config.pad + (sourceX * fullsize);
			const destY = config.pad + (sourceY * fullsize);

			if (config.extrude > 0) {
				for (let y = -config.extrude; y <= config.extrude; y++) {
					for (let x = -config.extrude; x <= config.extrude; x++) {
						renderTile(sourcePNG, sourceX, sourceY, this, destX + x, destY + y);
					}
				}
			}

			renderTile(sourcePNG, sourceX, sourceY, this, destX, destY);
		}
	}

	console.log("- writing " + config.output + "...");
	this.pack().pipe(fs.createWriteStream(config.output));
	console.log("- done!");
});
