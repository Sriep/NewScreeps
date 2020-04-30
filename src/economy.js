/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
//const role = require("role");

const economy = {

    LoadTime: {"harvester": 25, "upgrader": 25, "builder":25, "repairer": 25
        , "energy.porter" : 0, "worker" : 0},

    OffloadTime: {"harvester": 1, "upgrader": 50, "builder":5, "repairer": 50
        , "energy.porter" : 40 , "worker" : 40},

    findMostFreeNeighbours: function (room, pos, range) {
        const terrain = room.getTerrain()
        let bestSpots = [];
        let maxSoFar = -1
        //let delta = gc.DELTA_MOVES[range];
        let delta
        switch (range) {
            case 0: delta = [{x:0, y:0}]; break;
            case 1: delta = gc.ONE_MOVE; break;
            case 2: delta = gc.TWO_MOVES; break;
            case 3: delta = gc.THREE_MOVES; break;
            default: return gf.fatalError("findMostFreeNeighbours range to big = " + range.toString());
        }
        //let delta = gc.TWO_MOVES;
        //console.log("delta", JSON.stringify(delta))
        //console.log("gc.DELTA_MOVES)", JSON.stringify(gc.DELTA_MOVES))
        //console.log("ONE_MOVE", JSON.stringify(gc.ONE_MOVE))
        //console.log("delta", JSON.stringify(delta))
        for (let i in delta) {
            //console.log("i", i, "delta[i]", JSON.stringify(delta[i]));
            const x = pos.x + delta[i].x;
            const y = pos.y + delta[i].y;
            if (terrain.get(x,y) !== TERRAIN_MASK_WALL) {
                const nonWalls = this.countNonWallNeighbours(x, y, terrain)
                //console.log("countNonWallNeighbours nonWalls", nonWalls)
                if (nonWalls > maxSoFar) {
                    bestSpots.length = 0;
                    bestSpots = [new RoomPosition(x, y, room.name)]
                    maxSoFar = nonWalls;
                } else if (nonWalls === maxSoFar) {
                    bestSpots.push(new RoomPosition(x, y, room.name))
                    //bestSpots.push({x:x, y:y})
                }
            }
        }
        //console.log("bestSpots", bestSpots, "maxSoFar", maxSoFar)
        return bestSpots;
    },

    countNonWallNeighbours: function(x, y, terrain) {
        let count = 0;
        for (let i in gc.ONE_MOVE) {
            const X = x + gc.ONE_MOVE[i];
            const Y = y + gc.ONE_MOVE[i];
            if (terrain.get(X,Y) !== TERRAIN_MASK_WALL) {
                count++
            }
        }
        return count;
    },

    constructionLeft: function (room) {
        const sites = room.find(FIND_CONSTRUCTION_SITES);
        let construction = 0;
        for (let i in sites) {
            construction += sites[i].progressTotal - sites[i].progress
        }
        return construction;
    },

    totalSourceCapacity: function(room) {
        const sources = room.find(FIND_SOURCES);
        let sourceTotalCapacity = 0;
        for (let i in sources) {
            sourceTotalCapacity += sources[i].energyCapacity;
        }
        return sourceTotalCapacity;
    },

    estimateHomePorters : function(room) {
        rcl = room.controller.level;
        const carryParts = gc.RPC_PORTER_CARRY_PARTS[rcl];
        const roundTrip = this.roundTripLength(room, gc.RACE_PORTER)
        const tripsPerLife = (CREEP_LIFE_TIME - roundTrip) / roundTrip

        const energyPerPorter = carryParts * CARRY_CAPACITY * tripsPerLife;
        return Math.ceil(this.totalSourceCapacity(room) / energyPerPorter);
    },

    estimateHomeHarvesters : function(room) {
        return gc.RPC_HARVESTERS[room.controller.level]
    },

    porterShortfall: function (policy) {
        const existingPorterParts = this.existingPorterParts(policy);
        const portersNoCommitmentsEnergyLT = this.energyLifeTime(Game.rooms[policy.roomId], 1, "upgrader"); //todo what should this be?
        const sourceEnergyLT  = this.allSourcesEnergy(Game.rooms[policy.roomId]) *5;
        const energyBuildLinkersAndRepairer = 4*1000;
        const energyForUpgrading = sourceEnergyLT - energyBuildLinkersAndRepairer;
        const numPortersPartsNeeded = Math.max(5,energyForUpgrading / portersNoCommitmentsEnergyLT);
        return numPortersPartsNeeded - existingPorterParts;
    },

    existingPorterParts: function (policy) {
        const porters = _.filter(Game.creeps, function (creep) {
            return (creep.memory.policyId === policy.id);
        });
        let parts = 0;
        for (let i in porters) {
            parts = parts + porters[i].getActiveBodyparts(WORK);
        }
         return parts;
    },

    energyLifeTime: function (room, workerSize, role) {
        const loadTime = this.LoadTime[role];
        const offloadTime = this.OffloadTime[role];
        const roundTripTime = this.roundTripLength(room, role);
        const timePerTrip = loadTime + offloadTime + roundTripTime;
        const tripsPerLife = CREEP_LIFE_TIME / timePerTrip;
        const energyPerTrip = CARRY_CAPACITY * workerSize;
        return energyPerTrip * tripsPerLife;
    },

    roundTripLength: function(room, role) {
        switch (role) {
            case gc.RACE_WORKER:
                if (!room.memory.worker_round_trip) {
                    room.memory.worker_round_trip = this.getUpgradeRoundTripLength(room);
                }
                return room.memory.worker_round_trip;
            case gc.RACE_PORTER:
                if (!room.memory.porter_round_trip) {
                    room.memory.porter_round_trip = this.getUpgradeRoundTripLength(room);
                }
                return room.memory.worker_round_trip;
            default:
                return this.getUpgradeRoundTripLength(room);
        }
    },

    // todo need to be cached
    getUpgradeRoundTripLength: function (room) {
        if (room.memory.upgradeTrip === undefined)
        {
            room.memory.upgradeTrip = 2
                * this.avDistanceForm(room, FIND_SOURCES, room.controller.pos);
        }
        return  room.memory.upgradeTrip;
    },


    avDistanceBetweenObjs: function(room, objArray) {
        let distance = 0, paths = 0;
        for (let i in objArray) {
            for (let j in objArray) {
                if (i !== j) {
                    const path = room.findPath(objArray1[i].pos, objArray2[j].pos,  {
                        ignoreCreeps: true,
                        ignoreRoads: true,
                        ignoreDestructibleStructures: true});
                    distance += path.length;
                    paths++
                }
            }
        }
        return distance / paths;
    },

    avDistanceBetweenObjects: function (room, objArray1, objArray2) {
        let distance = 0;
        let journeys = 0;
        for ( let i in objArray1 ) {
            for ( let j in objArray2 ) {
                if (!room.findPath(objArray1[i].pos.isEqualTo(objArray2[j].pos))) {
                    const path = room.findPath(objArray1[i].pos, objArray2[j].pos,  {
                        ignoreCreeps: true,
                        ignoreRoads: true,
                        ignoreDestructibleStructures: true});
                    distance = distance + path.length;
                    journeys = journeys + 1;
                }
            }
        }
        return distance/journeys;
    },

    avDistanceBetween: function (room, findType1, findType2) {
        let distance = 0;
        const obj1s = room.find(findType1);
        if (obj1s.length > 0) {
            const obj2s = room.find(findType2);
            if (obj2s.length > 0) {
                return this.avDistanceBetweenObjects(room, obj1s, obj2s);
            }
        }
        return distance;
    },

    avDistanceFromObjects: function (room,objects,pos) {
        let distance = 0;
        let journeys = 0;
        for ( let i in objects ) {
            const path = room.findPath(objects[i].pos, pos, {
                ignoreCreeps: true,
                ignoreRoads: true,
                ignoreDestructibleStructures: true} );
            distance = distance + path.length;
            journeys = journeys + 1;
            // console.log("avDistanceForm path len" + path.length + " distance "
            //    + distance + " journeys " + journeys);
        }
        return distance/journeys;
    },

    avDistanceForm: function (room, findType, pos2) {
        let distance = 0;
        const objs = room.find(findType);
        if (objs.length > 0) {
            let journeys = 0;
            for ( let i in objs ) {
                const path = room.findPath(objs[i].pos, pos2, {
                    ignoreCreeps: true,
                    ignoreRoads: true,
                    ignoreDestructibleStructures: true} );
                distance = distance + path.length;
                journeys = journeys + 1;
                // console.log("avDistanceForm path len" + path.length + " distance "
                //     + distance + " journies " + journeys);
            }
            distance = distance/journeys;
        } // if (sources.length > 0)
        return distance;
    },

    allSourcesEnergy: function(room)
    {
        let habitableSourceEnergy = 0;
        const sources = room.find(FIND_SOURCES);
        for (let i in sources) {
            habitableSourceEnergy += sources[i].energyCapacity
        }
        return habitableSourceEnergy;
    },

    sourceAccessPointsArray: function (room, findType, opts) {
        const sites = room.find(findType,opts);
        const accessPoints = [];
        for ( let i = 0 ; i < sites.length ; i++ ) {
            accessPoints.push(this.countAccessPoints(sites[i].pos));
        }
        return accessPoints;
    },

    totalSourceAccessPointsRoom: function (room) {
        return this.accessPointsType(room, FIND_SOURCES);
    },

    accessPointsType: function (room, findType, opts) {
        const sites = room.find(findType,opts);
        let accessPoints = 0;
        for ( let i = 0 ; i < sites.length ; i++ ) {
            accessPoints += this.countAccessPoints(sites[i].pos);
        }
        return accessPoints;
    },

    countAccessPoints: function (pos)
    {
        const terrain = Game.rooms[pos.roomName].getTerrain()
        let accessPoints = 0;
        if (terrain.get(pos.x+1, pos.y) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x+1, pos.y+1) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x+1, pos.y-1) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x-1, pos.y) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x-1, pos.y+1) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x-1, pos.y-1) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x, pos.y+1) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        if (terrain.get(pos.x, pos.y-1) !== TERRAIN_MASK_WALL) {
            accessPoints = accessPoints+1;
        }
        //console.log("accessPoints", accessPoints, room.name)
        return accessPoints;
    },

}

module.exports = economy;