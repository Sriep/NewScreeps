/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const construction = require("construction");
const tile = require("tile");
const economy = require("economy");


function FlagRooom (name) {
    this.name = name;
    this.m = Game.flags[name].memory;
}

FlagRooom.prototype.placeCentre = function (centre, start) {
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
    this.setSourceContainers();
    this.setControllerContainers();
    //this.m["plan"][STRUCTURE_LINK+"_2"] = this.sourcesLinkPos();
    this.m["plan"][STRUCTURE_LINK] = this.m["plan"][STRUCTURE_LINK].concat(this.sourcesLinkPos())
};

FlagRooom.prototype.findLocationForCentre = function(centre, avoid) {
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

FlagRooom.prototype.getExtensionPos = function(terrain, start, avoid) {
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

FlagRooom.prototype.getTowerPos = function(terrain, start, avoid) {
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

FlagRooom.prototype.setSourceContainers = function () {
    const sources = Game.rooms[this.name].find(FIND_SOURCES);
    //console.log("setSourceContainers befor loop this.m",JSON.stringify(this.m));
    for (let source of sources) {
        //console.log("setSourceContainers room", source.room,"id",source.id);
        let spots = economy.findMostFreeNeighbours(
            Game.rooms[this.name], source.pos, 1
        );
        if (spots.length === 0) {
            return gf.fatalError("findMostFreeNeighbours cant get to source");
        }
        this.m.sources[source.id]["harvesterPosts"] = spots[0].neighbours;
        spots[0].pos.roomName = source.room.name;
        this.m.sources[source.id]["containerPos"] = spots[0].pos;
    }
    //console.log("setSourceContainers after loop this.m",JSON.stringify(this.m));
};

FlagRooom.prototype.setControllerContainers = function () {
    const room = Game.rooms[this.name];
    const terrain = room.getTerrain();
    let spots = construction.coverArea(room.controller.pos, 3, terrain);
    if (spots.length === 0) {
        return gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS findMostFreeNeighbours cant get to controller");
    }
    for (let spot of spots) {
        spot.posts = spot.posts.sort( (p1, p2) => {
            return room.controller.pos.getRangeTo(p1.x, p1.y) - room.controller.pos.getRangeTo(p2.x, p2.y)
        });
    }
    this.m.controller["upgraderPosts"] = spots;
};

FlagRooom.prototype.sourcesLinkPos = function() {
    const links = [];
    const sources = Game.rooms[this.name].find(FIND_SOURCES);
    for (let source of sources) {
        links.push(this.sLinkPos(source));
    }
    return links;
};

FlagRooom.prototype.sLinkPos = function(source) {
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

FlagRooom.prototype.buildStructure = function(type) {
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

    //console.log("type", type, "this.m.plan[type].length",this.m.plan[type].length,"beingBuilt"
    //    ,beingBuilt.length,"built.length",built.length,"allowed", allowed);

    if (built.length + beingBuilt.length < allowed) {
        if (this.m.plan[type].length <= built.length + beingBuilt.length) {
            return false;
        }
        const pt = this.m.plan[type][built.length + beingBuilt.length];

        //console.log("buildStructure pt",JSON.stringify(pt),"built.length + beingBuilt.length"
        //    ,built.length + beingBuilt.length);

        new RoomPosition(pt.x,pt.y,this.name).createConstructionSite(type)
    }
    return true;
};



module.exports = FlagRooom;