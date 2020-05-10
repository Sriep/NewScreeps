/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const cache = require("cache");

const construction = {
    buildRoadSourceController: function(room) {
        const controllerFlag = Game.flags[room.controller.id];
        ccPos = controllerFlag.memory.container;
        const sources = room.find(FIND_SOURCES);

        for (let j = 0 ; j < sources.length ; j++ ){
            buildRoad(sources[i].pos, room.controller.pos);
            buildRoad(sources[i].pos, ccPos);
        }
    },

    buildRoadSpawnController: function(room) {
        const controllerFlag = Game.flags[room.controller.id];
        ccPos = controllerFlag.memory.container;
        const spawns = room.find(FIND_MY_SPAWNS);

        for (let j = 0 ; j < spawns.length ; j++ ){
            buildRoad(spawns[i].pos, room.controller.pos);
            buildRoad(spawns[i].pos, ccPos);
        }
    },

    buildRoadSourceSpawn: function(room) {
        const sources = room.find(FIND_SOURCES);
        const spawns = room.find(FIND_MY_SPAWNS);
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < spawns.length ; j++ ){
                buildRoad(sources[i].pos, spawns[j].pos);
            }
        }
    },

    buildRoadSourceTowers: function(room) {
        const sources = room.find(FIND_SOURCES);
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < towers.length ; j++ ){
                buildRoad(sources[i].pos, spawns[j].pos);
            }
        }
    },

    buildRoadSources: function(room) {
        const sources = room.find(FIND_SOURCES);
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < sources.length ; j++ ){
                if (i !== j) {
                    buildRoad(sources[i].pos, sources[j].pos);
                }
            }
        }
    },

    buildRoadSourceExtensions: function(room) {
        const sources = room.find(FIND_SOURCES);
        const extensions = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < extensions.length ; j++ ){
                buildRoad(sources[i].pos, extensions[j].pos);
            }
        }
        const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < beingBuilt.length ; j++ ){
                buildRoad(sources[i].pos, beingBuilt[j].pos);
            }
        }
    },

    buildRoadsRoom: function (room) {
        let sources = room.find(FIND_SOURCES);
        const controller = room.controller;
        const spawns = room.find(FIND_MY_SPAWNS);
        let structures = room.find(FIND_MY_STRUCTURES, { filter: function (structure) {
                return structure.structureType === STRUCTURE_EXTRACTOR
                    || structure.structureType ===  STRUCTURE_STORAGE
                    || structure.structureType ===  STRUCTURE_EXTRACTOR }
        });
        structures.concat(spawns);
        structures.push(controller);

        //console.log(room,"buildroads betwen",structures);
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < structures.length ; j++ ){
                if ( i !== j) {
                    buildRoad(structures[i].pos, structures[j].pos);
                }
            }
        }
    },

    roadsBuilt: function(room) {
        return room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_ROAD }
        }) === 0;
    },

    coverArea: function (pos, range) {
        const terrain = Game.rooms[pos.roomName].getTerrain();
        const length = 2*range+1
        const deltas = this.nxmDeltaArray(length, length);
        const valid = [];
        for ( let dxy of deltas) {
            if (terrain.get(pos.x + dxy.x, pos.y+dxy.y) !== TERRAIN_MASK_WALL) {
                valid.push({x: pos.x+dxy.x, y: pos.y+dxy.y});
            }
        }

        return valid;
    },

    nxmDeltaArray: function(n,m) {
        const nmDelta = [];
        for (let i = 0 ; i < n ; i++) {
            for (let j = 0 ; j < m ; j++) {
                nnDelta.push({x : i, y: j})
            }
        }
        return nmDelta;
    },

    looseSpiral: function (start, numNeeded, avoid, terrain, avoidRange) {
        let range = 0;
        let spiral = [];
        console.log("about to start lose spiral loop")
        while (spiral.length < numNeeded) {
            range++;
            for (let dx = -1*range; dx <= range ; dx+=2 ) {
                if (start.x+dx < 5 || 45 < start.x+dx) {
                    continue
                }
                for (let dy = -1*range; dy <= range ; dy+=2 ) {
                    if (start.y+dy < 5 || 45 < start.y+dy) {
                        continue
                    }
                    if (this.pointOK(start.x +dx, start.y+dy, avoid, terrain, avoidRange)) {
                        spiral.push({x: start.x+dx, y: start.y+dy})
                        if (spiral.length >= numNeeded) {
                            return spiral
                        }
                    }
                }
            }
        }
    },

    pointOK: function(x, y, avoid, terrain, avoidRange) {
        if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
            return false;
        }
        for (let i in avoid) {
            if (Math.abs(avoid[i].x - x) <= avoidRange && Math.abs(avoid[i].y - y) <= avoidRange) {
                return false;
            }
        }
        return true
    },

    centerMass: function(points) { // need points.length > 0
        let totalX = 0;
        let totalY = 0;
        for (let i in points) {
            totalX += points[i].x;
            totalY += points[i].y
        }
        cx = Math.round(totalX/points.length);
        cy = Math.round(totalY/points.length);
        return {x: cx, y: cy };
    },

    closestNonWall: function (pos) {
        //return this.closestNonWall_I(pos);
        //const name = "closestNonWall_" + cache.sPos(pos);
        //console.log("closestNonWall pos", JSON.stringify(pos), "name",name, "result", result, "global", global["name"])
        return cache.global(
            this.closestNonWall_I,
            "closestNonWall_" + cache.sPos(pos),
            [pos],
        );
    },

    closestNonWall_I: function (pos) {
        //console.log("in closestNonWall_I pos", JSON.stringify(pos));
        const terrain = Game.rooms[pos.roomName].getTerrain();
        if (terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL) {
            //console.log("closestNonWall_I not entered loop", terrain.get(pos.x, pos.y), "wall",TERRAIN_MASK_WALL)
            return pos
        }
        //let range = 0;
        //console.log("closestNonWall_I range");
        //return (pos);
        //while (range < 50) {
        for (let range = 0; range < 50; range++) {
            //range++;
            //console.log("In closest non wall range", range, "cpu", Game.cpu.getUsed());
            //if (Game.cpu.Used > 50) {
            //    console.log("large cpu", Game.cpu.getUsed());
            //    return pos;
            //}
            for (let dx = -1*range; dx <= range ; dx++ ) {
                for (let dy = -1*range; dy <= range ; dy++ ) {
                    if (terrain.get(pos.x + dx, pos.y + dy) !== TERRAIN_MASK_WALL) {
                        return {x: pos.x + dx, y: pos.y + dy};
                    }
                }
            }
        }
        //console.log("closestNonWall_I fell though loop");
        return pos;
    },

    buildRoad: function(from, to) {
        const path = from.findPathTo(to, { ignoreCreeps: true, ignoreRoads: true});
        const room = Game.rooms[from.roomName];
        for(let step in path) {
            room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
        }
    }
};

module.exports = construction;