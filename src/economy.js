/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const role = require("role");

const economy = {

    LoadTime: {"harvester": 25, "upgrader": 25, "builder":25, "repairer": 25
        , "energy.porter" : 0, "worker" : 0},

    OffloadTime: {"harvester": 1, "upgrader": 50, "builder":5, "repairer": 50
        , "energy.porter" : 40 , "worker" : 40},

    porterShortfall: function (policy) {
        //console.log("In porterShortfall policy", JSON.stringify(policy))
        const existingPorterParts = this.existingPorterParts(policy);
        let energyInStorage;
        if ( Game.rooms[policy.roomId].storage !== undefined) {
            energyInStorage = Game.rooms[policy.roomId].storage.store[RESOURCE_ENERGY];
        } else {
            energyInStorage = 0;
        }
        const portersNoCommitmentsEnergyLT = this.energyLifeTime(Game.rooms[policy.roomId], 1, gc.ROLE_WORKER);
        //console.log("portersNoCommitmentsEnergyLT",portersNoCommitmentsEnergyLT)
        const sourceEnergyLT  = this.allSourcesEnergy(Game.rooms[policy.roomId]) *5;
        //console.log("sourceEnergyLT",sourceEnergyLT)
        const energyBuildLinkersAndRepairer = 4*1000;
        //console.log("energyBuildLinkersAndRepairer",energyBuildLinkersAndRepairer)
        const energyForUpgrading = sourceEnergyLT - energyBuildLinkersAndRepairer;
        //console.log("energyForUpgrading",energyForUpgrading)
        const numPortersPartsNeeded = Math.max(5,energyForUpgrading / portersNoCommitmentsEnergyLT);
        //console.log("numPortersPartsNeeded",numPortersPartsNeeded)
        const extraPartsForStorage = existingPorterParts - numPortersPartsNeeded;
        //console.log("extraPartsForStorage",extraPartsForStorage);
        const availableInStorage = Math.max(0, energyInStorage - gc.STORAGE_STOCKPILE - extraPartsForStorage * portersNoCommitmentsEnergyLT);
        //console.log("available InStorage",availableInStorage);
        const porterShortfall = numPortersPartsNeeded - existingPorterParts;
        //console.log("porterShortfall", porterShortfall);
        return porterShortfall;
    },

    existingPorterParts: function (policy) {
        const porters = _.filter(Game.creeps, function (creep) {
            return (creep.memory.policyId === policy.id
                &&  creep.memory.role === gc.ROLE_WORKER );
        });
        // console.log("existingPorterParts number creeps",porters.length);
        let parts = 0;
        for (var i in porters) {
            parts = parts + porters[i].getActiveBodyparts(WORK);
        }
        console.log("existingPorterParts  parts", parts);
        return parts;
    },

    energyLifeTime: function (room, workerSize, role) {
        //console.log("energy lifetime role", role, "Load Time", JSON.stringify(this.LoadTime));
        const loadTime = this.LoadTime[role];
        //console.log("energyLifeTime loadTime", loadTime);
        const offloadTime = this.OffloadTime[role];
        //console.log("energyLifeTime offloadTime", offloadTime);
        const roundTripTime = this.roundTripLength(room, role);
        //console.log("energyLifeTime roundTripTime", roundTripTime);
        const timePerTrip = loadTime + offloadTime + roundTripTime;
        const tripsPerLife = CREEP_LIFE_TIME / timePerTrip;
        const energyPerTrip = CARRY_CAPACITY * workerSize;
        return energyPerTrip * tripsPerLife;
    },

    roundTripLength: function(room, role) {
        switch (role) {
            case gc.ROLE_WORKER:
                return this.getUpgradeRoundTripLength(room);
            default:
                return this.getUpgradeRoundTripLength(room);
        }
    },

    getUpgradeRoundTripLength: function (room, force) {
        if (room.memory.upgradeTrip === undefined)
        {
            room.memory.upgradeTrip = 2
                * this.avDistanceForm(room, FIND_SOURCES, room.controller.pos);
        }
        return  room.memory.upgradeTrip;
    },

    avDistanceBetweenObjects: function (room, objArray1, objArray2) {
        let distance = 0;
        let journeys = 0;
        for ( let i in objArray1 ) {
            for ( let j in objArray2 ) {
                const path = room.findPath(objArray1[i].pos, objArray2[j].pos,  {
                    ignoreCreeps: true,
                    ignoreRoads: true,
                    ignoreDestructibleStructures: true});
                //   console.log("two points " + objArray1[i].pos + objArray2[j].pos);
                distance = distance + path.length;
                journeys = journeys + 1;
                // console.log("avDistanceBetweenObjects path len " + path.length + " distance "
                //           + distance + " journeys " + journeys);
            } //for ( var j in spawns )
        } //for ( var i in sources ) {
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
        } //  for ( var i in objs )
        return distance/journeys;
    },

    avDistanceForm: function (room, findType, pos2) {
        let distance = 0;
        const objs = room.find(findType);
        if (objs.length > 0) {
            var journeys = 0;
            for ( let i in objs ) {
                var path = room.findPath(objs[i].pos, pos2, {
                    ignoreCreeps: true,
                    ignoreRoads: true,
                    ignoreDestructibleStructures: true} );
                distance = distance + path.length;
                journeys = journeys + 1;
                // console.log("avDistanceForm path len" + path.length + " distance "
                //     + distance + " journies " + journeys);
            } ///  for ( var i in objs )
            distance = distance/journeys;
        } // if (sources.length > 0)
        return distance;
    },

    allSourcesEnergy: function(room)
    {
        var habitableSourceEnergy = 0;
        var sources = room.find(FIND_SOURCES);
        for (var i in sources) {
            habitableSourceEnergy += sources[i].energyCapacity
        }
        return habitableSourceEnergy;
    },

    maxPortersRoom: function (room) {
        if (!room.storage) {
            return this.accessPointsType(room, FIND_SOURCES) +  room.find(FIND_SOURCES).length;
        } else {
            return this.accessPointsType(room, FIND_SOURCES)
                +  room.find(FIND_SOURCES).length + 6;
        }
    },

    accessPointsType: function (room, findType, opts) {
        var sites = room.find(findType,opts);
        var accessPoints = 0;
        for ( let i = 0 ; i < sites.length ; i++ ) {
            accessPoints += this.countAccessPoints(room, sites[i].pos);
        }
        //console.log("accessPoints", accessPoints, room.name)
        return accessPoints;
    },

    countAccessPoints: function (room, pos)
    {
        const terrain = room.getTerrain()
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