'use strict';
var SpriteSheet = require('./../engine/spritesheet.js');

var map = {
    actor: {
        north: { x: 28, y: 0, width: 14, height: 14 },
        south: { x: 0, y: 0, width: 14, height: 14 },
        east: { x: 14, y: 0, width: 14, height: 14 },
        west: { x: 28, y: 0, width: 14, height: 14 }
    }
};
var image = new SpriteSheet('actors.png',map);

module.exports = Sheet;

function Sheet(sprite) {
    this.image = image;
    this.map = map[sprite];
}