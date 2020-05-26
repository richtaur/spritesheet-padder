#!/usr/local/bin/node

const fs = require("fs");
const PNG = require("pngjs").PNG;

console.log("reading input.png ...");
fs.createReadStream("input.png")
.pipe(new PNG())
.on("parsed", function() {
	for (let y = 0; y < this.height; y++) {
		for (let x = 0; x < this.width; x++) {
			const idx = (this.width * y + x) << 2;

			// invert color
			this.data[idx] = 255 - this.data[idx];
			this.data[idx+1] = 255 - this.data[idx+1];
			this.data[idx+2] = 255 - this.data[idx+2];

			// and reduce opacity
			this.data[idx+3] = this.data[idx+3] >> 1;
		}
	}

	console.log("writing ...");
	this.pack().pipe(fs.createWriteStream("output.png"));
	console.log("done! wrote output.png");
});
