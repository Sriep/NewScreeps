/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const construction = require("construction");

function FlagRooom (name, data) {
    this.name = name;
    this.m = data;
}

FlagRooom.prototype.placeCentre = function () {
    const room = Game.rooms[this.name];
    let avoid = [];
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        avoid = avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
    }
    avoid = avoid.concat(gf.posPlusDeltaArray(room.controller.pos, gc.THREE_MOVES));
    const start = construction.centreMass(avoid);
    construction.placeRectangle(this.name, start, n, m, avoid)
};

module.exports = FlagRooom;