/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const construction = require("construction");

FlagRooom.prototype.TOWER_3x3 = {
    "x_dim": 3,
    "y_dim": 3,
    "tower": [
        {"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},
        {"x":1,"y":1},{"x":0,"y":2},{"x":2,"y":2},
    ]
};

FlagRooom.prototype.EXTENSION_5_3x3 = {
    "x_dim": 3,
    "y_dim": 3,
    "extension": [
        {"x":0,"y":0},{"x":2,"y":0},{"x":0,"y":2},{"x":1,"y":1},{"x":2,"y":2},
    ]
};

FlagRooom.prototype.EXTENSION_10_4x4 = {
    "x_dim": 4,
    "y_dim": 4,
    "extension": [
        {"x":1,"y":0},{"x":2,"y":0},{"x":0,"y":1},{"x":2,"y":1},{"x":3,"y":1},
        {"x":0,"y":2},{"x":1,"y":2},{"x":3,"y":2},{"x":1,"y":3},{"x":2,"y":3},
    ]
};

FlagRooom.prototype.CENTRE_6x6_1 = {
    "origin" : {"x":0,"y":0},
    "x_dim" : 6,
    "y_dim": 6,
    STRUCTURE_LAB : [
        {"x":2,"y":3},{"x":2,"y":4},{"x":3,"y":3},
        {"x":2,"y":5},
        {"x":1,"y":3},{"x":1,"y":2},{"x":2,"y":2},{"x":2,"y":3},{"x":2,"y":4},{"x":1,"y":4}
    ],
    STRUCTURE_STORAGE : [{"x":4,"y":4}],
    STRUCTURE_TERMINAL : [{"x":4,"y":5}],
    STRUCTURE_LINK : [{"x":3,"y":5}],
    STRUCTURE_SPAWN : [{"x":0,"y":0},{"x":3,"y":0},{"x":4,"y":0}],
    STRUCTURE_POWER_SPAWN : [{"x":1,"y":0}],
    "stationary_creep" : {"x":3,"y":4},
    STRUCTURE_ROAD : [
        {"x":0,"y":5},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":2},{"x":0,"y":1},{"x":0,"y":0},
        {"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":5,"y":1},
        {"x":5,"y":0},{"x":5,"y":2},{"x":5,"y":3},{"x":5,"y":4},{"x":5,"y":5},
        {"x":4,"y":3}, {"x":3,"y":4}
    ],
    STRUCTURE_OBSERVER:  [{"x":1,"y":5}]
};

function FlagRooom (name) {
    this.name = name;
    this.m = Game.flags[name].memory;
}

FlagRooom.prototype.placeCentre = function (centre, start) {
    console.log("FlagRooom placeCentre this", JSON.stringify(this));
    console.log("placeCentre centre", JSON.stringify(centre),"start", JSON.stringify(start));
    const room = Game.rooms[this.name];
    if (!this.m.avoid) {
        this.m.avoid = [];
    }
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        this.m.avoid = this.m.avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
    }
    this.m.avoid = this.m.avoid.concat(gf.posPlusDeltaArray(room.controller.pos, gc.THREE_MOVES));

    if (!start) {
        const mass = [];
        const sources = room.find(FIND_SOURCES);
        for (let source of sources) {
            mass.push(source.pos);
        }
        mass.push(room.controller.pos);
        start = construction.centreMass(mass);
    }

    const terrain = new Room.Terrain(this.name);
    centre["origin"] = construction.placeRectangle(terrain, start, centre.x_dim, centre.y_dim, avoid);
    this.m["plan"] = centre;
    for ( let dx = 0 ; dx < centre.x_dim ; dx++ ) {
        for ( let dy = 0 ; dy < centre.y_dim ; dy++ ) {
            this.m.avoid.push({"x":centre["origin"]+dx, "y":centre["origin"]+dy})
        }
    }
    this.m["plan"][STRUCTURE_TOWER] = this.getTowerPos(terrain, centre.origin);
    this.m["plan"][STRUCTURE_EXTENSION] = this.getExtensionPos(terrain, centre.origin);
    this.m["plan"][STRUCTURE_LINK] = this.getLinkPos(terrain);
    this.console.log("FlagRooom ",JSON.stringify(this));
};

FlagRooom.prototype.getExtensionPos = function(terrain, start) {
    this.m["plan"][EXTENSION_5_3x3] = [];
    for ( let i = 0 ; i < 12  ; i++ ) {
        const origin = construction.placeRectangle(
            terrain, start, EXTENSION_5_3x3.x_dim, EXTENSION_5_3x3.y_dim, this.m.avoid
        );
        for (let delta of EXTENSION_5_3x3) {
            this.m.avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            this.m["plan"][STRUCTURE_TOWER].push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        }
    }
};

FlagRooom.prototype.getTowerPos = function(terrain, start) {
    const origin = construction.placeRectangle(terrain, start, TOWER_3x3.x_dim, TOWER_3x3.y_dim, this.m.avoid);
    this.m["plan"][STRUCTURE_TOWER] = [];
    for (let delta of TOWER_3x3) {
        this.m.avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        this.m["plan"][STRUCTURE_TOWER].push({"x":origin.x+delta.x, "y":origin.y+delta.y});
    }
};

FlagRooom.prototype.getLinkPos = function(terrain) {

};

FlagRooom.prototype.buildStructure = function(type) {
    const room = Game.rooms[this.name];
    const rcl = room.controller.level;
    const allowed = CONTROLLER_STRUCTURES[type][rcl];
    const built = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: type }
    });
    if (built.length >= allowed)  {
        return false;
    }
    const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: type }
    });
    if (built.length + beingBuilt.length < allowed) {
        if (this.m.centre[type].length < built.length + beingBuilt.length) {
            return false;
        }
        const pt = this.m.centre[type][built.length + beingBuilt.length-1];
        new RoomPosition(pt.x,pt.y,this.name).createConstructionSite(type)
    }
    return true;
};

module.exports = FlagRooom;