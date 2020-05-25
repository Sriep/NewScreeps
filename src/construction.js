/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
//const TERRAIN_MASK_WALL = C.TERRAIN_MASK_WALL;

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

    buildRoadSourceTowers: function(room) {
        const sources = room.find(FIND_SOURCES);
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });
        for (let i = 0 ; i < sources.length ; i++ ){
            for (let j = 0 ; j < towers.length ; j++ ){
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
        });
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

    roadsBuilt: function(room) {
        return room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_ROAD }
        }).length === 0;
    },

    coverArea: function (pos, range, terrain) {
        //console.log("coverArea pos", JSON.stringify(pos), "range", range, "terrain", terrain);
        const deltas = this.nxmDeltaArray(range, range);
        let valid = [];
        for ( let dxy of deltas) {
            if (terrain.get(pos.x + dxy.x, pos.y+dxy.y) !== C.TERRAIN_MASK_WALL) {
                valid.push({x: pos.x+dxy.x, y: pos.y+dxy.y, adj: 0, missed : [], hit : [] });
            }
        }
        for (let pt1 of valid) {
            for (let pt2 of valid) {
                if (this.withinRange(pt1, pt2, 1)) {
                    pt1.adj++;
                    pt1.hit.push({x: pt2.x, y: pt2.y});
                } else {
                    pt1.missed.push({x: pt2.x, y: pt2.y});
                }
            }
        }
        valid = valid.sort( function (a,b)  {
            return b.adj - a.adj;
        });
        const maxAdj = valid[0].adj;
        valid = valid.filter(v => v.adj > maxAdj/2);
        let bestSoFar = 0;
        for (let i = 0 ; i < valid.length ; i++) {
            if (valid[i].adj <= valid[0].adj/2) {
                break;
            }
            for (let pt1 of valid[i].missed) {
                let adj = 0;
                const hits = [];
                for (let pt2 of valid[i].missed) {
                    if (this.withinRange(pt1, pt2, 1)) {
                        adj++;
                        hits.push({x: pt2.x, y:pt2.y})
                    }
                }
                if (adj > bestSoFar) {
                    bestSoFar = adj;
                    valid[i].bestCompaiongAdj = bestSoFar;
                    valid[i].bestCompanion = pt1;
                    valid[i].bestCompanionPosts = hits;
                    valid[i].bestTotalAdj = valid[i].adj + bestSoFar;
                }
            }
        }
        valid = valid.sort( function (a,b)  {
            return b.bestTotalAdj - (a.bestTotalAdj);
        });
        if (valid[0].bestCompanion) {
            return [ {
                x: valid[0].x,
                y: valid[0].y,
                "numPosts": valid[0].adj ,
                "posts": valid[0].hit
            },
                {
                    x: valid[0].bestCompanion.x,
                    y: valid[0].bestCompanion.y,
                    "numPosts" : valid[0].bestCompaiongAdj,
                    "posts": valid[0].bestCompanionPosts
                } ]
        }
        return [ { x: valid[0].x, y: valid[0].y, "posts" : valid[0].adj} ];
    },
    withinRange(pos1, pos2, range) {
        return Math.abs(pos1.x - pos2.x) <= range && Math.abs(pos1.y - pos2.y) <= range
    },

    nxmDeltaArray: function(n,m) {
        const nmDelta = [];
        for (let i = -n ; i <= n ; i++) {
            for (let j = -m ; j <= m ; j++) {
                nmDelta.push({x : i, y: j})
            }
        }
        return nmDelta;
    },

    findArea: function (start, avoid, terrain, points) {

    },

    looseSpiral: function (start, numNeeded, avoid, terrain, avoidRange) {
        //console.log("looseSpiral start",JSON.stringify(start),"numNeeded",
        //    numNeeded,"avoid",avoid,"terrain",terrain,"avoidRange",avoidRange);
        let range = 0;
        let spiral = [];
        //console.log("about to start lose spiral loop");
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
                        spiral.push({x: start.x+dx, y: start.y+dy});
                        if (spiral.length >= numNeeded) {
                            return spiral
                        }
                    }
                }
            }
        }
    },

    pointOK: function(x, y, avoid, terrain, avoidRange) {
        if (terrain.get(x, y) === C.TERRAIN_MASK_WALL) {
            return false;
        }
        for (let i in avoid) {
            if (Math.abs(avoid[i].x - x) <= avoidRange && Math.abs(avoid[i].y - y) <= avoidRange) {
                return false;
            }
        }
        return true
    },

    centreMass: function(points) { // need points.length > 0
        let totalX = 0;
        let totalY = 0;
        for (let i in points) {
            totalX += points[i].x;
            totalY += points[i].y
        }
        const cx = Math.round(totalX/points.length);
        const cy = Math.round(totalY/points.length);
        return {x: cx, y: cy };
    },

/*
    closestNonWall: function (pos) {
        return cache.global(
            this.closestNonWall_I,
            "closestNonWall_" + cache.sPos(pos),
            [pos],
        );
    },
*/
    closestNonWall: function (pos) {
        //console.log("in closestNonWall_I pos", JSON.stringify(pos));
        const terrain = Game.rooms[pos.roomName].getTerrain();
        if (terrain.get(pos.x, pos.y) !== C.TERRAIN_MASK_WALL) {
            //console.log("closestNonWall_I not entered loop", terrain.get(pos.x, pos.y), "wall",C.TERRAIN_MASK_WALL)
            return pos
        }
        for (let range = 0; range < 50; range++) {
             for (let dx = -1*range; dx <= range ; dx++ ) {
                for (let dy = -1*range; dy <= range ; dy++ ) {
                    if (terrain.get(pos.x + dx, pos.y + dy) !== C.TERRAIN_MASK_WALL) {
                        return {x: pos.x + dx, y: pos.y + dy};
                    }
                }
            }
        }
        return pos;
    },

    placeRectangle: function(terrain, centre, n, m) {
        const data = this.planWall_2(terrain);
        let range = 0;
        while (range < 20) {
            range++;
            for (let dx = -1*range; dx <= range ; dx+=2 ) {
                if (centre + dx < 5 || centre+dx >45) {
                    continue
                }
                for (let dy = -1*range; dy <= range ; dy+=2 ) {
                    if (centre + dx < 5 || centre+dx >45) {
                        continue
                    }
                    const rectangle = this.canFitRectangle(terrain, centre.x+dx, centre.y+dy, n, m, data);
                    if (rectangle) {
                        return rectangle;
                    }
                }
            }
        }
    },

    canFitRectangle: function (terrain, x, y, n, m, data) {
        if (terrain.get(x,y) === C.TERRAIN_MASK_WALL){
            return false;
        }
        const t = n; n = Math.max(n,m); m = Math.min(t,m);
        for (let dx = 0 ; dx < n ; dx++) {
            for (let dy = 0; dy < m; dy++) {
                //if (dy in data.yArray) {
                    if (terrain.get(x + dx, y + dy) === C.TERRAIN_MASK_WALL) {
                        //console.log("wall x",x + dx, "y",y + dy, "terrain", terrain.get(x + dx, y + dy),
                        //    "C.TERRAIN_MASK_WALL",C.TERRAIN_MASK_WALL);
                        return;
                    }
                //}
            }
        }
        const pts = [];
        for (let dx = 0 ; dx < n ; dx++) {
            for (let dy = 0; dy < m; dy++) {
                pts.push({"x":x+dx, "y":y+dy})
            }
        }
        return pts;
    },

    planWall_2: function(terrain) {
        const wallStateChangeY = [];
        for (let x = 0 ; x < 50 ; x++) {
            wallStateChangeY.push([]);
            let lastTerrainWall = true;
            for (let y = 0 ; y < 50 ; y++ ) {
                if (terrain.get(x,y) === C.TERRAIN_MASK_WALL) {
                    if (!lastTerrainWall) {
                        wallStateChangeY[x].push(-y);
                        lastTerrainWall = true;
                    }
                } else {
                    if (lastTerrainWall) {
                        wallStateChangeY[x].push(y);
                        lastTerrainWall = false;
                    }
                }
            }
        }

        const wallStateChangeX = [];
        for (let y = 0 ; y < 50 ; y++) {
            wallStateChangeX.push([]);
            let lastTerrainWall = true;
            for (let x = 0 ; x < 50 ; x++ ) {
                if (terrain.get(x,y) === C.TERRAIN_MASK_WALL) {
                    if (!lastTerrainWall) {
                        wallStateChangeX[y].push(-x);
                        lastTerrainWall = true;
                    }
                } else {
                    if (lastTerrainWall) {
                        wallStateChangeX[y].push(x);
                        lastTerrainWall = false;
                    }
                }
            }
        }
        return {"xArray": wallStateChangeX, "yArray": wallStateChangeY}
    },

    planwall_1: function(terrain, centre) {
        let yUp = [];
        let yDown = [];
        for( let x = 0 ; x < 50 ; x ++ ) {
            yDown[x] = 0;
            while ( yDown[x] < centre.y && terrain.get(x, centre.y-yDown[x]) !== C.TERRAIN_MASK_WALL) { yDown[x]++}
            yUp[x] = 0;
            while ( yUp[x] < 50-centre.y && terrain.get(x, centre.y+yUp[x]) !== C.TERRAIN_MASK_WALL) { yUp[x]++}
        }

        let xRight = [];
        let xLeft = [];
        for( let y = 0 ; y < 50 ; y ++ ) {
            for( let y = 0 ; y < 50 ; y ++ ) {
                xLeft[y] = 0;
                while ( xLeft[y] < centre.x && terrain.get(centre.x-xLeft[y], y) !== C.TERRAIN_MASK_WALL) { xLeft[y]++}
                xRight[y] = 0;
                while ( xRight[y] < 50-centre.x && terrain.get(centre.x-xRight[y], y) !== C.TERRAIN_MASK_WALL) { xRight[y]++}
            }
        }
        return { "yUp" :yUp,"yDown":yDown, "xRight":xRight,"xLeft":xLeft }
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


























