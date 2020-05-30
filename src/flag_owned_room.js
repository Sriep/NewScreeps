/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const construction = require("construction");
const tile = require("tile");
const flag = require("flag");

function FlagOwnedRoom (name) {
    this.name = name;
    this.m = flag.getRoomFlag(name).memory;
    console.log("FlagRooom m", JSON.stringify(this.m))
}

FlagOwnedRoom.prototype.placeCentre = function (centre, start) {
    let avoid = [];
    const sources = Game.rooms[this.name].find(FIND_SOURCES);
    for (let source of sources) {
        avoid = avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
    }
    avoid = avoid.concat(gf.posPlusDeltaArray(Game.rooms[this.name].controller.pos, gc.THREE_MOVES));

    this.m["plan"] = tile.getCopy(centre);
    if (start) {
        this.m["plan"]["origin"] = start;
    } else {
        this.m["plan"]["origin"] = this.findLocationForCentre(centre, avoid);
    }
    tile.shiftToOrigin(this.m["plan"]);
    for ( let dx = 0 ; dx < this.m["plan"].x_dim ; dx++ ) {
        for ( let dy = 0 ; dy < this.m["plan"].y_dim ; dy++ ) {
            avoid.push({
                "x": this.m["plan"]["origin"].x + dx,
                "y": this.m["plan"]["origin"].y + dy
            })
        }
    }
    const terrain = new Room.Terrain(this.name);
    this.m["plan"][STRUCTURE_TOWER] = this.getTowerPos(terrain, this.m["plan"].origin, avoid);
    this.m["plan"][STRUCTURE_EXTENSION] = this.getExtensionPos(terrain, this.m["plan"].origin, avoid);

    this.m["plan"][STRUCTURE_LINK].push(this.setControllerLinkPos());
    this.m["plan"][STRUCTURE_LINK] = this.m["plan"][STRUCTURE_LINK].concat(this.setSourcesLinkPos())
};

FlagOwnedRoom.prototype.findLocationForCentre = function(centre, avoid) {
    const mass = [];
    const sources = Game.rooms[this.name].find(FIND_SOURCES);
    for (let source of sources) {
        mass.push(source.pos);
    }
    mass.push(Game.rooms[this.name].controller.pos);
    const start = construction.centreMass(mass);

    const terrain = new Room.Terrain(this.name);
    return construction.placeRectangle(
        terrain, start, centre.x_dim, centre.y_dim, avoid
    );
};

FlagOwnedRoom.prototype.getExtensionPos = function(terrain, start, avoid) {
    const rtv = [];
    for ( let i = 0 ; i < 12  ; i++ ) {
        const origin = construction.placeRectangle(
            terrain, start, tile.EXTENSION_5_3x3.x_dim, tile.EXTENSION_5_3x3.y_dim, avoid
        );
        for (let delta of tile.EXTENSION_5_3x3[STRUCTURE_EXTENSION]) {
            avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        }
    }
    return rtv;
};

FlagOwnedRoom.prototype.getTowerPos = function(terrain, start, avoid) {
    const origin = construction.placeRectangle(
        terrain, start, tile.TOWER_3x3.x_dim, tile.TOWER_3x3.y_dim, avoid
    );
    const rtv = [];
    this.m["plan"][STRUCTURE_TOWER] = [];
    for (let delta of tile.TOWER_3x3[STRUCTURE_TOWER]) {
        avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
    }
    return rtv;
};

FlagOwnedRoom.prototype.setSourcesLinkPos = function() {
    const links = [];
    const sources = Game.rooms[this.name].find(FIND_SOURCES);
    for (let source of sources) {
        links.push(this.sLinkPos(source));
    }
    return links;
};

FlagOwnedRoom.prototype.setControllerLinkPos = function() {
    const room = Game.rooms[this.name];
    const terrain = room.getTerrain();
    const posts = this.m.controller.upgraderPosts;
    for (let delta of gc.ONE_MOVE) {
        if (terrain.get(posts.x+delta.x, posts.y+delta.y) !== TERRAIN_MASK_WALL) {
            return new RoomPosition(posts.x+delta.x, posts.y+delta.y, room.name);
        }
    }

};

FlagOwnedRoom.prototype.sourceLinkPos = function(id) {

};

FlagOwnedRoom.prototype.sLinkPos = function(source) {
    const containerPos = this.m.sources[source.id]["containerPos"];
    const terrain = source.room.getTerrain();
    let adjacent = 0;
    let linkPos;
    for (let delta of gc.ONE_MOVE) {
        if (terrain.get(containerPos.x+delta.x, containerPos.y+delta.y) !== TERRAIN_MASK_WALL) {
            if (adjacent === 0) {
                adjacent++
            } else {
                linkPos = new RoomPosition(containerPos.x+delta.x, containerPos.y+delta.y, source.room.name);
                return linkPos;
            }
        }
    }
};

FlagOwnedRoom.prototype.buildStructure = function(type) {
    if (!this.m.plan[type] || this.m.plan[type].length === 0) {
        return false;
    }
    const room = Game.rooms[this.name];
    const rcl = room.controller.level;
    //console.log("type", type,"buildStructure this",JSON.stringify(this));
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
    if (this.m.plan[type].length <= built.length + beingBuilt.length) {
        return false;
    }

    if (built.length + beingBuilt.length < allowed) {
        if (this.m.plan[type].length <= built.length + beingBuilt.length) {
            return false;
        }
        const pt = this.m.plan[type][built.length + beingBuilt.length];

        new RoomPosition(pt.x,pt.y,this.name).createConstructionSite(type)
    }
    return true;
};



module.exports = FlagOwnedRoom;