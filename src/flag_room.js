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
    "lab" : [
        {"x":2,"y":3},{"x":2,"y":4},{"x":3,"y":3},
        {"x":2,"y":5},
        {"x":1,"y":3},{"x":1,"y":2},{"x":2,"y":2},{"x":2,"y":3},{"x":2,"y":4},{"x":1,"y":4}
    ],
    "storage" : [{"x":4,"y":4}],
    "terminal" : [{"x":4,"y":5}],
    "link" : [{"x":3,"y":5}],
    "spawn" : [{"x":0,"y":0},{"x":3,"y":0},{"x":4,"y":0}],
    "powerSpawn" : [{"x":1,"y":0}],
    "stationary_creep" : {"x":3,"y":4},
    "road" : [
        {"x":0,"y":5},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":2},{"x":0,"y":1},{"x":0,"y":0},
        {"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":5,"y":1},
        {"x":5,"y":0},{"x":5,"y":2},{"x":5,"y":3},{"x":5,"y":4},{"x":5,"y":5},
        {"x":4,"y":3}, {"x":3,"y":4}
    ],
    "observer":  [{"x":1,"y":5}]
};

function FlagRooom (name) {
    this.name = name;
    this.m = Game.flags[name].memory;
}

FlagRooom.prototype.placeCentre = function (centre, start) {
    //console.log("FlagRooom placeCentre this", JSON.stringify(this));
    console.log("placeCentre centre", JSON.stringify(centre),"start", JSON.stringify(start));
    const room = Game.rooms[this.name];
    let avoid = [];
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        avoid = avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
    }
    avoid = avoid.concat(gf.posPlusDeltaArray(room.controller.pos, gc.THREE_MOVES));
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
    centre["origin"] = construction.placeRectangle(
        terrain, start, centre.x_dim, centre.y_dim, avoid
    );
    this.m["plan"] = centre;
    for ( let dx = 0 ; dx < centre.x_dim ; dx++ ) {
        for ( let dy = 0 ; dy < centre.y_dim ; dy++ ) {
            avoid.push({"x":centre["origin"]+dx, "y":centre["origin"]+dy})
        }
    }
    this.m["plan"]["tower"] = this.getTowerPos(terrain, centre.origin, avoid);
    this.m["plan"]["extension"] = this.getExtensionPos(terrain, centre.origin, avoid);
    this.m["plan"]["link"] = this.getLinkPos(terrain);
    //console.log("FlagRooom this.m[plan]",JSON.stringify(this.m["plan"]));
    //console.log("FlagRooom this.m[plan][extension]",JSON.stringify(this.m["plan"]["extension"]));
};

FlagRooom.prototype.getExtensionPos = function(terrain, start, avoid) {
    //console.log("this.EXTENSION_5_3x3", JSON.stringify(this.EXTENSION_5_3x3));
    //console.log("extension this.m[plan]", JSON.stringify(this.m["plan"]));
    const rtv = [];
    for ( let i = 0 ; i < 12  ; i++ ) {
        const origin = construction.placeRectangle(
            terrain, start, this.EXTENSION_5_3x3.x_dim, this.EXTENSION_5_3x3.y_dim, avoid
        );
        for (let delta of this.EXTENSION_5_3x3["extension"]) {
            avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        }
        //console.log(i,"getExtensionPos origin", JSON.stringify(origin),"rtv",JSON.stringify(rtv));
        //console.log(i,"getExtensionPos avoid", JSON.stringify(avoid));
    }
    return rtv;
};

FlagRooom.prototype.getTowerPos = function(terrain, start, avoid) {
    //console.log("this.TOWER_3x3", JSON.stringify(this.TOWER_3x3));
    const origin = construction.placeRectangle(
        terrain, start, this.TOWER_3x3.x_dim, this.TOWER_3x3.y_dim, avoid
    );
    const rtv = [];
    this.m["plan"]["tower"] = [];
    for (let delta of this.TOWER_3x3["tower"]) {
        avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
    }
    return rtv;
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