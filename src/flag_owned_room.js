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

    get origin() {
        return cache.dPos(this.plan["origin"], this.home)
    }

    get link() {
        return cache.deserialiseRoArray(this.plan[STRUCTURE_LINK], this.home)
    }

    get tower() {
        return cache.deserialiseRoArray(this.plan[STRUCTURE_TOWER], this.home)
    }

    get extension() {
        return cache.deserialiseRoArray(this.plan[STRUCTURE_EXTENSION], this.home)
    }

    get centreTile() {
        return this.plan["centreTile"]
    }

    get plan() {
        return this.memory.plan;
    };

    get xDim() {
        return tile.centres[this.centreTile].xDim;
    }

    get yDim() {
        return tile.centres[this.centreTile].yDim;
    }

    get labMap() {
        return tile.centres[this.centreTile].labMap;
    }

    get baseLabs() {
        return tile.centres[this.centreTile].baseLabs;
    }

    get lab() {
        return this.getTileItem(STRUCTURE_LAB)
    }

    get storage() {
        return this.getTileItem(STRUCTURE_STORAGE)
    }

    get terminal() {
        return this.getTileItem(STRUCTURE_TERMINAL)
    }

    get spawn() {
        return this.getTileItem(STRUCTURE_SPAWN)
    }

    get powerSpawn() {
        return this.getTileItem(STRUCTURE_POWER_SPAWN)
    }

    get scientist() {
        return this.getTileItem("scientist")
    }

    get observer() {
        return this.getTileItem(STRUCTURE_OBSERVER)
    }

    get centre() {
        return  cache.global(
            FlagOwnedRoom.prototype._centre,
            this,
            [],
            "FLO." +this.name + ".centre",
        );
    }

    _centre() {
        const centre = tile.getCopy(tile.centres[this.centreTile]);
        centre.origin = this.origin;
        tile.shiftToOrigin(centre);
        return centre;
    };

    getTileItem(type) {
        return  cache.global(
            FlagOwnedRoom.prototype._getTileItem,
            this,
            [type],
            "FLO." +this.name + ".getTileItem." + type,
        );
    }

    _getTileItem(type) {
        const item = {};
        item[type] = tile.getCopy(tile.centres[this.centreTile][type]);
        item["origin"] = this.origin;
        tile.shiftToOrigin(item);
        return item[type]
    }

    placeCentre(centreTile, start) {
        let avoid = [];
        const sources = Game.rooms[this.name].find(FIND_SOURCES);
        for (let source of sources) {
            avoid = avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
        }
        avoid = avoid.concat(gf.posPlusDeltaArray(Game.rooms[this.name].controller.pos, gc.THREE_MOVES));

        this.memory.plan = {};
        this.plan["centreTile"] = centreTile;
        const centre = tile.centres[centreTile];
        let origin = start ? start : this.findLocationForCentre(centre.xDim, centre.yDim, avoid);
        this.plan["origin"] = cache.sPoint(origin);
        for ( let dx = 0 ; dx < centre.xDim ; dx++ ) {
            for ( let dy = 0 ; dy < centre.yDim ; dy++ ) {
                avoid.push({
                    "x": origin.x + dx,
                    "y": origin.y + dy
                })
            }
        }

        const terrain = new Room.Terrain(this.name);
        this.plan[STRUCTURE_TOWER] = cache.serialisePath(this.getTowerPos(terrain, origin, avoid));
        this.plan[STRUCTURE_EXTENSION] = cache.serialisePath(this.getExtensionPos(terrain, origin, avoid));
        this.plan[STRUCTURE_LINK] = cache.serialisePath(this.linkPos());
    }

    placeCentreOld(centreTile, start) {
        const centre = tile.centres[centreTile];
        let avoid = [];
        const sources = Game.rooms[this.name].find(FIND_SOURCES);
        for (let source of sources) {
            avoid = avoid.concat(gf.posPlusDeltaArray(source.pos, gc.ONE_MOVE))
        }
        avoid = avoid.concat(gf.posPlusDeltaArray(Game.rooms[this.name].controller.pos, gc.THREE_MOVES));

        this.memory.plan = tile.getCopy(centre);
        if (start) {
            this.plan["origin"] = start;
        } else {
            const tileCentre = tile.centres[centreTile];
            this.plan["origin"] = this.findLocationForCentre(tileCentre.xDim, tileCentre.yDim, avoid);
        }
        tile.shiftToOrigin(this.plan);
        for ( let dx = 0 ; dx < this.m["plan"].x_dim ; dx++ ) {
            for ( let dy = 0 ; dy < this.m["plan"].y_dim ; dy++ ) {
                avoid.push({
                    "x": this.m["plan"]["origin"].x + dx,
                    "y": this.m["plan"]["origin"].y + dy
                })
            }
        }

        const terrain = new Room.Terrain(this.name);
        this.plan[STRUCTURE_TOWER] = this.getTowerPos(terrain, this.m["plan"].origin, avoid);
        this.plan[STRUCTURE_EXTENSION] = this.getExtensionPos(terrain, this.m["plan"].origin, avoid);

        this.plan[STRUCTURE_LINK].push(this.setControllerLinkPos());
        this.plan[STRUCTURE_LINK] = this.m["plan"][STRUCTURE_LINK].concat(this.setSourcesLinkPos());

        this.plan["centre"] = centreTile
    };

    findLocationForCentre(xDim, yDim, avoid) {
        const mass = [];
        const sources = Game.rooms[this.name].find(FIND_SOURCES);
        for (let source of sources) {
            mass.push(source.pos);
        }
        mass.push(Game.rooms[this.name].controller.pos);
        const start = construction.centreMass(mass);

        const terrain = new Room.Terrain(this.name);
        return construction.placeRectangle(
            terrain, start, xDim, yDim, avoid
        );
    };

    getExtensionPos(terrain, start, avoid) {
        //console.log("getExtensionPos", JSON.stringify(start));
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
        //console.log("getTowerPos", JSON.stringify(start));
        const towerTile = tile.getCopy(tile.towers[gc.TILE_TOWERS]);
        const origin = construction.placeRectangle(
            terrain, start, towerTile.x_dim, towerTile.y_dim, avoid
        );
        const rtv = [];
        for (let delta of towerTile[STRUCTURE_TOWER]) {
            avoid.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
            rtv.push({"x":origin.x+delta.x, "y":origin.y+delta.y});
        }
        return rtv;
    };

    linkPos() {
        const links = [];
        let linkSource = 0;
        let sourceLinkPos = this.sourceLinkPos();
        let linkExit = 0;
        let exitLinkPos = this.exitLinkPos();
        let linkController = 0;
        let controllerLinkPos = this.controllerLinkPos();
        for (let linkType of tile.links) {
            switch (linkType) {
                case gc.LINK_POS.Exit:
                    if (exitLinkPos.length > linkExit) {
                        links.push(exitLinkPos[linkExit]);
                        linkExit++
                    }
                    break;
                case gc.LINK_POS.Source:
                    if (sourceLinkPos.length > linkSource) {
                        links.push(sourceLinkPos[linkSource]);
                        linkSource++
                    }
                    break;
                case gc.LINK_POS.Controller:
                    if (controllerLinkPos.length > linkController) {
                        links.push(controllerLinkPos[linkController]);
                        linkController++
                    }
                    break;
                case gc.LINK_POS.Storage:
                    links.push(this.centre.link[0]);
                    break;
                default:
                    gf.fatalError("Invalid link type", linkType);
            }
        }
        return links;
    }

    sourceLinkPos() {
        const links = [];
        const sources = Game.rooms[this.name].find(FIND_SOURCES);
        for (let source of sources) {
            links.push(this.sLinkPos(source));
        }
        return links;
    };

    // todo improve this logic
    controllerLinkPos() {
        const room = Game.rooms[this.name];
        const terrain = room.getTerrain();
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

    exitLinkPos() {
        const terrain = Game.map.getRoomTerrain(this.home);
        const exitLinks = [];
        const exits = Game.map.describeExits(this.home);
        for ( let direction in exits ) {
            const route = Game.map.findRoute(this.home, exits[direction]);
            let targetPos;
            for ( let i = 0 ; i < 49 && !targetPos ; i++ ) {
                switch (direction) {
                    case C.TOP:
                        if (terrain.get(i, 0) !== TERRAIN_MASK_WALL) {
                            targetPos = {x:i, y:0}
                        }
                        break;
                    case C.RIGHT:
                        if (terrain.get(49, i) !== TERRAIN_MASK_WALL) {
                            targetPos = {x:49, y:i}
                        }
                        break;
                    case C.BOTTOM:
                        if (terrain.get(i, 49) !== TERRAIN_MASK_WALL) {
                            targetPos = {x:i, y:49}
                        }
                        break;
                    case C.LEFT:
                        if (terrain.get(0, i) !== TERRAIN_MASK_WALL) {
                            targetPos = {x:0, y:i}
                        }
                        break;
                }
            }
            if (targetPos) {
                exitLinks.push(targetPos)
            }
        }
        return exitLinks;
    }


    sLinkPos(source) {
        //FlagRoom = require("flag_room");
        const fRoom = new FlagRoom(this.name);
        const containerPos = fRoom.upgradeContainerPos[0];
        //console.log("sLinkPos containerPos", JSON.stringify(fRoom.upgradeContainerPos));
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

    flagLabs(boost, stores, numLabs) {
        //console.log("flagLags boost",boost, "stores",JSON.stringify(stores), "labsLength", numLabs)
        const mapping = lr.mapReagentsToLabs(
            lr.reagentMap(boost, stores),
            numLabs,
            this.baseLabs,
            this.labMap
        );
        //console.log("flagLabs mapping", JSON.stringify(mapping));
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
        //console.log(type,"type buildStructure this[type]",JSON.stringify(this[type]));
        if (!this[type] || this[type].length === 0) {
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
            //console.log("buildStructure built.length", built.length, "allowed", allowed);
            return false;
        }
        const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: type }
        });
        if (this[type].length <= built.length + beingBuilt.length) {
            //console.log("buildStructure this[type].length", this[type].length, "beingBuilt", beingBuilt.length);
            return false;
        }

        if (built.length + beingBuilt.length < allowed) {
            if (this[type].length <= built.length + beingBuilt.length) {
                return false;
            }
            const pt = this[type][built.length + beingBuilt.length];
            //console.log("buildStructure about to construct", JSON.stringify(pt));
            gf.roomPosFromPos(pt, this.name).createConstructionSite(type)
            //(new RoomPosition(pt.x,pt.y,this.name)).createConstructionSite(type)
        }
        return true;
    };
}

if (gc.USE_PROFILER && !gc.UNIT_TEST) {
    const profiler = require('screeps-profiler');
    profiler.registerClass(FlagOwnedRoom, 'FlagOwnedRoom');
}

module.exports = FlagOwnedRoom;