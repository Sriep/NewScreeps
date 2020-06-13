/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gc = require("./gc");
const gf = require("./gf");
const construction = require("./construction");
const tile = require("./tile");
const flag = require("./flag");
const lr = require("./lab_reactions");
const cache = require("./cache");
const FlagRoom = require("./flag_room");

class FlagOwnedRoom extends FlagRoom {
    constructor (name) {
        super(name);
        this.m = flag.getRoomFlag(name).memory;
    }

    placeCentre(centreTile, start) {
        const centre = tile.centres[centreTile];
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
        this.m["plan"][STRUCTURE_LINK] = this.m["plan"][STRUCTURE_LINK].concat(this.setSourcesLinkPos());

        this.m["plan"]["centre"] = centreTile
    };

    plan(objType) {
        return cache.global(
            FlagOwnedRoom.prototype._planObj,
            this,
            [objType],
            "FLO." + this.name + ".plan" + objType
        )
    };

    centre() {
        return  cache.global(
            FlagOwnedRoom.prototype._centre,
            this,
            [],
            "FLO." +this.name + ".centre",
        );
    };

    _centre() {
        const centre = tile.getCopy(tile.centres[this.m["plan"]["centre"]]);
        tile.shiftToOrigin(centre);
        return centre;
    };

    _plan(obj) {
        switch (obj) {
            case tile.p.XDim:
                return tile.centres[this.m["plan"]["centre"]][tile.p.XDim];
            case tile.p.YDim:
                return tile.centres[this.m["plan"]["centre"]][tile.p.YDim];
            case tile.p.Origin:
                return this.centre()[tile.p.Origin];
            case tile.p.BaseLabs:
                return tile.centres[this.m["plan"]["centre"]][tile.p.BaseLabs];
            case tile.p.LabMap:
                return JSON.parse(tile.centres[this.m["plan"]["centre"]][tile.p.LabMap]);
            case tile:
                return centre["base_labs"];
            case C.STRUCTURE_LINK:
            case C.STRUCTURE_TOWER:
            case C.STRUCTURE_EXTENSION:
                return cache.deserialiseRoArray(this.m["plan"][obj]);
            case C.STRUCTURE_LAB:
            case C.STRUCTURE_TERMINAL:
            case C.STRUCTURE_SPAWN:
            case C.STRUCTURE_POWER_SPAWN:
            case C.STRUCTURE_ROAD:
            case C.STRUCTURE_OBSERVER:
            case tile.p.Scientist:
                return cache.deserialiseRoArray(this.centre()[obj]);
            case undefined:
                return this.centre();
            default:
                gf.fatalError("unknown room plan obj", obj, "room", this.room.name)
        }
    };

    findLocationForCentre(centre, avoid) {
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

    getExtensionPos(terrain, start, avoid) {
        const rtv = [];
        const extensionPlan = tile.extensions[gc.TILE_EXTENSIONS];
        const numExtTiles = C.CONTROLLER_STRUCTURES[C.STRUCTURE_EXTENSION][8]/extensionPlan.extensions;
        for ( let i = 0 ; i < numExtTiles  ; i++ ) {
            const extensionTile = tile.getCopy(extensionPlan);
            const origin = construction.placeRectangle(
                terrain, start, extensionTile.x_dim, extensionTile.y_dim, avoid
            );
            for (let delta of extensionTile[STRUCTURE_EXTENSION]) {
                avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
                rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            }
        }
        return rtv;
    };

    getTowerPos(terrain, start, avoid) {
        const towerTile = tile.getCopy(tile.towers[gc.TILE_TOWERS]);
        const origin = construction.placeRectangle(
            terrain, start, towerTile.x_dim, towerTile.y_dim, avoid
        );
        const rtv = [];
        this.m["plan"][STRUCTURE_TOWER] = [];
        for (let delta of towerTile[STRUCTURE_TOWER]) {
            avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        }
        return rtv;
    };

    setSourcesLinkPos() {
        const links = [];
        const sources = Game.rooms[this.name].find(FIND_SOURCES);
        for (let source of sources) {
            links.push(this.sLinkPos(source));
        }
        return links;
    };

    // todo improve this logic
    setControllerLinkPos() {
        const room = Game.rooms[this.name];
        const terrain = room.getTerrain();
        //console.log("setControllerLinkPos this.m", JSON.stringify(this.m.controller));
        // = require("flag_room");
        const fRoom = new FlagRoom(this.name);
        fRoom.upgradeContainerPos;
        const posts = fRoom.upgradeContainerPos;
        const post = posts[0];
        for (let delta of gc.ONE_MOVE) {
            if (terrain.get(post.x+delta.x, post.y+delta.y) !== TERRAIN_MASK_WALL) {
                return new RoomPosition(post.x+delta.x, post.y+delta.y, room.name);
            }
        }
    };

    sourceLinkPos(id) {

    };

    controllerLinkPos(id) {

    };

    sLinkPos(source) {
        //FlagRoom = require("flag_room");
        const fRoom = new FlagRoom(this.name);
        const containerPos = fRoom.upgradeContainerPos[0];
        console.log("sLinkPos containerPos", JSON.stringify(fRoom.upgradeContainerPos));
        //const containerPos = this.m.sources[source.id]["containerPos"];
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

    flagLabs(boost, stores) {
        const labs = Game.rooms[this.home].find(C.FIND_MY_STRUCTURES,
            { filter: s => { return s.structureType === C.STRUCTURE_LAB }
            }
        );
        const mapping = lr.mapReagentsToLabs(
            lr.reagentMap(boost, stores),
            labs.length,
            this.m["plan"], // this.plan(),
        );
        this.colourLabFlags(mapping);
    };

    colourLabFlags(labs, mappings) {
        for ( let r in mappings ) {
            const colours = gc.LAB_COLOURS[r];
            Game.flags[labs[mappings[r]].id].setColor(
                colours.color, colours.secondaryColor
            )
        }
    };

    buildStructure(type) {
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
}

module.exports = FlagOwnedRoom;