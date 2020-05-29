#!/usr/local/bin/node

const fs = require("fs");
const PNG = require("pngjs").PNG;

const config = {
	input: "example_input.png",
	output: "example_output.png",
	tilesize: 64,
	pad: 16,
	extrude: 4,
};

// Transfers pixel data from source to destination
// sourceX/Y are tiles, destX/Y are pixels (sorry)
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
		}
	}
}

// Setup
const package = JSON.parse(fs.readFileSync("package.json", "utf8"))
console.log("> " + package.name + " v" + package.version + ":");
console.log("- reading " + config.input + " ...");

// Read the input PNG
fs.createReadStream(config.input).pipe(new PNG()).on("parsed", function () {
	// Create a clean new destination PNG
	const cols = this.width / config.tilesize;
	const rows = this.height / config.tilesize;
	const fullsize = config.tilesize + config.pad;
	const newWidth = config.pad + (cols * fullsize);
	const newHeight = config.pad + (rows * fullsize);
	const destPNG = new PNG({
		width: newWidth,
		height: newHeight,
	});

	// Render the tiles
	for (let sourceY = 0; sourceY < rows; sourceY++) {
		for (let sourceX = 0; sourceX < cols; sourceX++) {
			const destX = config.pad + (sourceX * fullsize);
			const destY = config.pad + (sourceY * fullsize);

			if (config.extrude > 0) {
				for (let y = -config.extrude; y <= config.extrude; y++) {
					for (let x = -config.extrude; x <= config.extrude; x++) {
						renderTile(this, sourceX, sourceY, destPNG, x + destX, y + destY);
					}
				}
			}

			renderTile(this, sourceX, sourceY, destPNG, destX, destY);
		}
	}

	destPNG.pack().pipe(fs.createWriteStream(config.output));
	console.log("- success! wrote to " + config.output);
});
