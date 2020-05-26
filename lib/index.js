#!/usr/local/bin/node

console.log("spritesheet-padder");

var fs = require("fs"),
PNG = require("pngjs").PNG;

fs.createReadStream("input.png")
.pipe(new PNG())
.on("parsed", function() {

	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			var idx = (this.width * y + x) << 2;

			// invert color
			this.data[idx] = 255 - this.data[idx];
			this.data[idx+1] = 255 - this.data[idx+1];
			this.data[idx+2] = 255 - this.data[idx+2];

			// and reduce opacity
			this.data[idx+3] = this.data[idx+3] >> 1;
		}
	}

	this.pack().pipe(fs.createWriteStream("output.png"));
});
