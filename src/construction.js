/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */

const construction = {
    buildRoadSourceController: function(room) {
        const controllerFlag = Game.flags[room.controller.id];
        ccPos = controllerFlag.memory.container;
        const sources = room.find(FIND_SOURCES);

        for (let j = 0 ; j < sources.length ; j++ ){
            this.buildRoad(sources[i].pos, room.controller.pos);
            this.buildRoad(sources[i].pos, ccPos);
        }
    },

    buildRoadSpawnController: function(room) {
        const controllerFlag = Game.flags[room.controller.id];
        ccPos = controllerFlag.memory.container;
        const spawns = room.find(FIND_MY_SPAWNS);

        for (let j = 0 ; j < spawns.length ; j++ ){
            this.buildRoad(spawns[i].pos, room.controller.pos);
            this.buildRoad(spawns[i].pos, ccPos);
        }
    },

    buildRoadSourceSpawn: function(room) {
        const sources = room.find(FIND_SOURCES);
        const spawns = room.find(FIND_MY_SPAWNS);
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < spawns.length ; j++ ){
                this.buildRoad(sources[i].pos, spawns[j].pos);
            }
        }
    },

    buildRoadSources: function(room) {
        const sources = room.find(FIND_SOURCES);
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < sources.length ; j++ ){
                if (i !== j) {
                    this.buildRoad(sources[i].pos, sources[j].pos);
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
                this.buildRoad(sources[i].pos, extensions[j].pos);
            }
        }
        const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        })
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < beingBuilt.length ; j++ ){
                this.buildRoad(sources[i].pos, beingBuilt[j].pos);
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
                    this.buildRoad(structures[i].pos, structures[j].pos);
                }
            }
        }
    },

    buildRoad: function(from, to) {
        const path = from.findPathTo(to, { ignoreCreeps: true, ignoreRoads: true});
        const room = Game.rooms[from.roomName];
        for(let step in path) {
            room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
        }
    },

    roadsBuilt: function(room) {
        return room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_ROAD }
        }) === 0;
    },

    finishBuildingMissingExtensions: function(room) {
        console.log("finishBuildingMissingExtensions")
        const rcl = room.controller.level;
        const allowedExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl]
        const extensions = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        })
        const wantedExtensions = allowedExtensions - extensions.length - beingBuilt.length;
        if (wantedExtensions > 0) {
            //buildExtensions(room, wantedExtensions);
            buildExtensions(room, 1);
        }
        return extensions === wantedExtensions;
    },
}

buildExtensions = function (room, numNeeded) {
    console.log("buildExtensions room", room.id, "numNeeded", numNeeded)
    const sources = room.find(FIND_SOURCES);
    const spawns  = room.find(FIND_MY_SPAWNS);
    let keyPts = []
    for (let i in sources) {
        keyPts.push(sources[i].pos)
    }
    let avoid = keyPts;
    for (let i in spawns) {
        keyPts.push(spawns[i].pos)
    }
    let start = centerMass(keyPts);
    start = closestNonWall(start, terrain);
    console.log("centerMass at", JSON.stringify(start));

    const structs = room.find(FIND_MY_STRUCTURES)
    for (let i in structs) {
        avoid.push(structs[i].pos)
    }

    const extensionPos = looseSpiralFromAvoid(start, numNeeded, avoid, 1)
    for (let i in extensionPos) {
        room.createConstructionSite(extensionPos[i], STRUCTURE_EXTENSION)
    }
}

looseSpiral = function (start, numNeeded, avoid) {
    const terrain = Game.rooms[pos.roomName].getTerrain(pos.RoomName);
    //const start = closestNonWall(pos, terrain);
    let range = 0;
    let spiral = [start];
    console.log("about to start lose spiral loop")
    while (spiral.length < numNeeded) {
        range++;
        for (let dx = -1*range; dx <= range ; dx+=2 ) {
            if (x+dx < 5 || 45 < x+dx) {
                continue
            }
            for (let dy = -1*range; dy <= range ; dy+=2 ) {
                if (y+dy < 5 || 45 < y+dy) {
                    continue
                }
                if (pointOK(start.x +dx, start.y+dy, avoid, terrain, avoidRange)) {
                    spiral.push({x: start.x+dx, y: start.y+dy})
                    if (spiral.length >= numNeeded) {
                        return spiral
                    }
                }
            }
        }
    }
}
/*
looseSpiralFromAvoid = function (pos, numNeeded, avoid, avoidRange) {
    const terrain = Game.rooms[pos.roomName].getTerrain(pos.RoomName);
    const start = closestNonWall(pos, terrain);
    let range = 0;
    let spiral = [start];
    while (spiral.length < numNeeded) {
        range++;
        for (let dx = -1*range; dx <= range ; dx+=2 ) {
            for (let dy = -1*range; dy <= range ; dy+=2 ) {
                if (dx !== range && dy !== range)
                    continue;
                if (pointOK(start.x +dx, start.y+dy, avoid, terrain, avoidRange)) {
                    spiral.push(new RoomPosition(start.x+dx, start.y+dy, pos.roomName))
                    if (spiral.length >= numNeeded) {
                        return spiral
                    }
                }
            }
        }
    }
}
*/
pointOK = function(x, y, avoid, terrain, avoidRange) {
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        return false;
    }
    for (let i in avoid) {
        if (Math.abs(avoid[i].x - x) <= avoidRange && Math.abs(avoid[i].y - y) <= avoidRange) {
            return false;
        }
    }
    return true
}

centerMass = function(points) { // need points.length > 0
    let totalX = 0
    let totalY = 0;
    for (let i in points) {
        totalX += points[i].x;
        totalY += points[i].y
    }
    cx = Math.round(totalX/points.length);
    cy = Math.round(totalY/points.length);
    return {x: cx, y: cy };
}

closestNonWall = function (pos, terrain) {
    if (terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL) {
        return pos
    }
    let range = 0
    while (true) {
        range++
        for (let dx = -1*range; dx <= range ; range++ ) {
            for (let dy = -1*range; dy <= range ; range++ ) {
                if (terrain.get(pos.x + dx, pos.y + dy) !== TERRAIN_MASK_WALL) {
                    return pos;
                }
            }
        }
        if (range > 50) {
            return gf.fatalError("cant find non wall point within " + range.toString() + " of " + pos.toString());
        }
    }
}

module.exports = construction;