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
        })
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

    areExtensionsBuilt: function(room) {
        const rcl = room.controller.level;
        const allowedExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl]
        const extensions = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        //beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        //    filter: { structureType: STRUCTURE_EXTENSION }
        //})
        return allowedExtensions === extensions.length;
    },

    finishBuildingMissingExtensions: function(room) {
        //console.log("finishBuildingMissingExtensions room", JSON.stringify(room))
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
            buildExtensions(room, wantedExtensions);
            //buildExtensions(room, 1);
        }
        return extensions === wantedExtensions;
    },

    looseSpiral: function (start, numNeeded, avoid, terrain, avoidRange) {
        let range = 0;
        let spiral = [];
        //console.log("about to start lose spiral loop")
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
                    if (pointOK(start.x +dx, start.y+dy, avoid, terrain, avoidRange)) {
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

    closestNonWall: function (pos, terrain) {
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
    },

    buildRoad: function(from, to) {
        const path = from.findPathTo(to, { ignoreCreeps: true, ignoreRoads: true});
        const room = Game.rooms[from.roomName];
        for(let step in path) {
            room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
        }
    }
};


/*
// todo refactor for when extensions are built
buildExtensions = function (room, numNeeded) {
    //console.log("buildExtensions room", room.id, "numNeeded", numNeeded)
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
    const terrain = room.getTerrain();
    start = closestNonWall(start, terrain);
   // console.log("centerMass at", JSON.stringify(start));

    const structs = room.find(FIND_MY_STRUCTURES)
    for (let i in structs) {
        avoid.push(structs[i].pos)
    }

    const extensionPos = looseSpiral(start, numNeeded, avoid, terrain,1)
    if (extensionPos) {
        for (let i in extensionPos) {
            result = room.createConstructionSite(extensionPos[i].x, extensionPos[i].y, STRUCTURE_EXTENSION);
            if (result !== OK) {
                //console.log("build extension",i,"result",result,"at",JSON.stringify(extensionPos[i]));
                //console.log("buildExtensions build extensino failed result", result.toString());
            }
        }
    }
};

looseSpiral = function (start, numNeeded, avoid, terrain, avoidRange) {
    let range = 0;
    let spiral = [];
    //console.log("about to start lose spiral loop")
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
                if (pointOK(start.x +dx, start.y+dy, avoid, terrain, avoidRange)) {
                    spiral.push({x: start.x+dx, y: start.y+dy})
                    if (spiral.length >= numNeeded) {
                        return spiral
                    }
                }
            }
        }
    }
};

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
};

centerMass = function(points) { // need points.length > 0
    let totalX = 0;
    let totalY = 0;
    for (let i in points) {
        totalX += points[i].x;
        totalY += points[i].y
    }
    cx = Math.round(totalX/points.length);
    cy = Math.round(totalY/points.length);
    return {x: cx, y: cy };
};

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
*/
module.exports = construction;