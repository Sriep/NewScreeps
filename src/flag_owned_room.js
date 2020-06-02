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
const lr = require("lab_reactions");

function FlagOwnedRoom (name) {
    this.name = name;
    //console.log("FlagOwnedRoom name", name);
    this.m = flag.getRoomFlag(name).memory;
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
    //console.log("setControllerLinkPos this.m", JSON.stringify(this.m.controller));
    const posts = this.m.controller.upgraderPosts[0];
    for (let delta of gc.ONE_MOVE) {
        if (terrain.get(posts.x+delta.x, posts.y+delta.y) !== TERRAIN_MASK_WALL) {
            //console.log("setControllerLinkPos x",posts.x+delta.x,"y",posts.y+delta.y,"name", room.name)
            return new RoomPosition(posts.x+delta.x, posts.y+delta.y, room.name);
        }
    }
};

FlagOwnedRoom.prototype.sourceLinkPos = function(id) {

};

FlagOwnedRoom.prototype.controllerLinkPos = function(id) {

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
// mapReagentsToLabs : function (leftMap, labsInRange, labsLeft, rightStack, labMap, leafLabs) {
FlagOwnedRoom.prototype.flagLabs = function(boost, stores) {
    const labs = Game.rooms[this.home].find(C.FIND_MY_STRUCTURES,
        { filter: s => { return s.structureType === C.STRUCTURE_LAB }
        }
    );
    const mapping = lr.mapReagentsToLabs(
        lr.reagentMap(boost, stores),
        labs.length,
        this.m["plan"],
    );
    this.colourLabFlags(mapping);
};

FlagOwnedRoom.prototype.colourLabFlags = function(labs, mappings) {
    for ( let r in mappings ) {
        colours = gc.LAB_COLOURS[r];
        Game.flags[labs[mappings[r]].id].setColor(
            colours.color, colours.secondaryColor
        )
    }
};
/*
FlagOwnedRoom.prototype.colourLabFlags = function(labs, colours) {
    for ( let i = 0 ; i< labs.length ; i++ ) {
        Game.flags[labs[i].id].setColor(
            colours[i].color, colours[i].secondaryColor
        )
    }
};
*/
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