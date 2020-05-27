/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const construction = require("construction");
const tile = require("tile");

function FlagRooom (name) {
    this.name = name;
    this.m = Game.flags[name].memory;
}

FlagRooom.prototype.placeCentre = function (centre, start) {
    this.m["plan"] = tile.getCopy(centre);
    if (start) {
        this.m["plan"]["origin"] = start;
    } else {
        this.m["plan"]["origin"] = this.findLocationForCentre(centre);
    }
    tile.shiftToOrigin(this.m["plan"]);
    for ( let dx = 0 ; dx < this.m["plan"].x_dim ; dx++ ) {
        for ( let dy = 0 ; dy < this.m["plan"].y_dim ; dy++ ) {
            avoid.push({"x":this.m["plan"]["origin"]+dx, "y":this.m["plan"]["origin"]+dy})
        }
    }
    this.m["plan"]["tower"] = this.getTowerPos(terrain, this.m["plan"].origin, avoid);
    this.m["plan"]["extension"] = this.getExtensionPos(terrain, this.m["plan"].origin, avoid);
    this.m["plan"]["link"] = this.getLinkPos(terrain);
};

FlagRooom.prototype.findLocationForCentre = function(centre) {
    const room = Game.rooms[this.name];
    let avoid = [];
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        avoid = avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
    }
    avoid = avoid.concat(gf.posPlusDeltaArray(room.controller.pos, gc.THREE_MOVES));

    const mass = [];
    for (let source of sources) {
        mass.push(source.pos);
    }
    mass.push(room.controller.pos);
    const start = construction.centreMass(mass);

    const terrain = new Room.Terrain(this.name);
    return construction.placeRectangle(
        terrain, start, centre.x_dim, centre.y_dim, avoid
    );
};

FlagRooom.prototype.getExtensionPos = function(terrain, start, avoid) {
    const rtv = [];
    for ( let i = 0 ; i < 12  ; i++ ) {
        const origin = construction.placeRectangle(
            terrain, start, tile.EXTENSION_5_3x3.x_dim, tile.EXTENSION_5_3x3.y_dim, avoid
        );
        for (let delta of tile.EXTENSION_5_3x3["extension"]) {
            avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        }
    }
    return rtv;
};

FlagRooom.prototype.getTowerPos = function(terrain, start, avoid) {
    const origin = construction.placeRectangle(
        terrain, start, tile.TOWER_3x3.x_dim, tile.TOWER_3x3.y_dim, avoid
    );
    const rtv = [];
    this.m["plan"]["tower"] = [];
    for (let delta of tile.TOWER_3x3["tower"]) {
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
    console.log("type", type,"buildStructure this",JSON.stringify(this));
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
        if (this.m.plan[type].length <= built.length + beingBuilt.length) {
            return false;
        }
        const pt = this.m.plan[type][built.length + beingBuilt.length];
        new RoomPosition(pt.x,pt.y,this.name).createConstructionSite(type)
    }
    return true;
};



module.exports = FlagRooom;