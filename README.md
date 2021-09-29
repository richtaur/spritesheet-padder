# Spritesheet Padder

Pads a sheet of sprites.

## TODO

- bug: oops package.json pulls from local folder
+ implement config.extrude
	- add config to only extrude certain tiles ... how to define?
	- by index? by individual tile? (like a grid? sounds cumbersome)
- bug: hangs when extrude is too large (attempting to read too deep?)

## How to install

```
yarn link (optional)
yarn global add ./spritesheet-padder
```

## Usage

* `spritesheet-padder`
* `i`, `input` input file (e.g. `input.png`)
* `o`, `output` output file (e.g. `output.png`)
* `t`, `tilesize` tilesize (e.g. `64` for 64x64 pixel tiles)
* `p`, `pad` padding, how much to add between tiles (e.g. `2` for 2 pixels)
* `e`, `extrude` how much to extrude (e.g. `2` it draws the tile beyond the edges by 2 pixels)

## Example

```
spritesheet-padder -i input.png -o output.png -t 64 -p 2 -e 1
```

Reads `input.png`, writes to `output.png`, cutting it up into `64x64` tiles, adding 2 pixels of tiles between each, and extruding the edges out by 1 pixel.
