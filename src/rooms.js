/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const race = require("race");
const rooms = {

    flag: function (room) {
        //console.log("in flag room", room)
        let myRoom = room.controller && room.controller.my;
        this.flagPermanents(room, myRoom);
        if (myRoom) {
            console.log("is my room ", room, myRoom)
            this.flagMyRoomStructures(room);
        }
    },

    flagPermanents: function (room, myRoom) {
        //console.log("flagPermanents room", room, "myRoom", myRoom);
        let flagName;

        const keeperLairs = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_KEEPER_LAIR }
        });
        for ( i in keeperLairs ) {
            flagName = keeperLairs[i].id;
            if (!Game.flags[flagName])
                keeperLairs[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_KEEPERS_LAIR_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_KEEPERS_LAIR;
            Game.flags[flagName].memory.keeperLairRoom = true;
        }

        const sources = room.find(FIND_SOURCES);
        for ( let i in sources ) {
            flagName = sources[i].id;
            if (!Game.flags[flagName])
                sources[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_SOURCE_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_SOURCE;
            Game.flags[flagName].memory.resourceType = RESOURCE_ENERGY;
            Game.flags[flagName].memory.energyCapacity = sources[i].energyCapacity;
            if (room.controller && !myRoom) {
                Game.flags[flagName].memory.upgradeController = true;
            }
            if (keeperLairs.length > 0) Game.flags[flagName].memory.keeperLairRoom = true;
        }
        if (room.controller) {
            flagName = room.controller.id;
            if (!Game.flags[flagName])
                room.controller.pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_CONTROLLER_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_CONTROLLER;
            if (!myRoom) {
                Game.flags[flagName].memory.upgradeController = (sources.length >= gc.SOURCES_REVERSE_CONTROLLER);
            }
            if (keeperLairs.length > 0) Game.flags[flagName].memory.keeperLairRoom = true;
        }

        const minerals = room.find(FIND_MINERALS);
        for ( i in minerals ) {
            flagName =  minerals[i].id;
            if (!Game.flags[flagName])
                minerals[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_MINERAL_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_MINERAL;
            Game.flags[flagName].memory.resourceType = minerals[i].mineralType;
            //Game.flags[flagName].memory.extractor = gf.isStructureTypeAtPos(minerals[i].pos, STRUCTURE_EXTRACTOR);
            if (keeperLairs.length > 0) Game.flags[flagName].memory.keeperLairRoom = true;
        }

        const walls = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_WALL }
        });
        for ( i in walls ) {
            flagName = walls[i].id;
            if (!Game.flags[flagName])
                walls[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_WALL_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_WALL;
        }

        const portals = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_PORTAL }
        });
        for ( i in portals ) {
            flagName = portals[i].id;
            if (!Game.flags[flagName])
                portals[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_PORTAL_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_PORTAL;
            Game.flags[flagName].memory.destination = portals[i].destination;
            if (portals[i].ticksToDecay)
                Game.flags[flagName].memory.decay = Game.time + portals[i].ticksToDecay;
        }

        room.memory.flagged = true;
    },

    flagMyRoomStructures: function (room) {
        const links = room.find(FIND_STRUCTURES, {
            filter: function(struc) {
                return struc.structureType === STRUCTURE_LINK;
            }
        });
        for ( let i = 0 ; i < links.length ; i++ ) {
            var flagName = links[i].id;
            if (!Game.flags[flagName])
                links[i].pos.createFlag(flagName, gc.FLAG_STRUCTURE_COLOUR, gc.FLAG_LINK_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_LINK;
        }

        const labs = room.find(FIND_STRUCTURES, {
            filter: function(struc) {
                return struc.structureType === STRUCTURE_LAB;
            }
        });
        for ( let i = 0 ; i < labs.length ; i++ ) {
            flagName = labs[i].id;
            if (!Game.flags[flagName])
                labs[i].pos.createFlag(flagName, gc.FLAG_LAB_COLOUR, gc.FLAG_LAB_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_LAB;
        }

        const tarminals = room.find(FIND_STRUCTURES, {
            filter: function(struc) {
                return struc.structureType === STRUCTURE_TERMINAL;
            }
        });
        for ( let i = 0 ; i < tarminals.length ; i++ ) {
            flagName = tarminals[i].id;
            if (!Game.flags[flagName])
                tarminals[i].pos.createFlag(flagName, gc.FLAG_STRUCTURE_COLOUR, gc.FLAG_TERMINAL_COLOUR);
            Game.flags[flagName].memory.type = gc.FLAG_TERMINAL;
        }
    },










    energyLifeTime: function (room, workerSize, role) {
        console.log("energyLifeTime worker size ",  workerSize);
        console.log("energyLifeTime role ", role);

        const roundTripTime = this.roundTripLength(room, role);
        const timePerTrip = race.LoadTime[role] + race.OffloadTime[role] + roundTripTime;
        const tripsPerLife = CREEP_LIFE_TIME / timePerTrip;
        const energyPerTrip = CARRY_CAPACITY * workerSize;
        console.log("energyLifeTime", energyPerTrip * tripsPerLife)
        return energyPerTrip * tripsPerLife;
    },

    roundTripLength: function(room, role, force) {
        switch (role) {
            case role.Type.HARVESTER:
                return this.getHarvestRoundTripLength(room, force);
            case role.Type.UPGRADER:
                return this.getUpgradeRoundTripLength(room, force);
            case role.Type.BUILDER:
                return this.getBuilderRoundTripLength(room, force);
            case role.Type.REPAIRER:
                return this.getRepairerRoundTripLength(room, force);
            case role.Type.ENERGY_PORTER:
                return this.getUpgradeRoundTripLength(room, force);
            case role.Type.ROLE_FLEXI_STORAGE_PORTER:
                return this.getUpgradeRoundTripLength(room, force);
            default:
                return this.getUpgradeRoundTripLength(room, force);
        }
    },

    getHarvestRoundTripLength: function (room, force) {
        if (room.memory.havestTrip === undefined || force === true)
        {
            room.memory.havestTrip = 2 *
                this.avDistanceBetween(room, FIND_SOURCES, FIND_MY_SPAWNS);
        }
        return  room.memory.havestTrip;
    },

    getUpgradeRoundTripLength: function (room, force) {
        if (room.memory.upgradeTrip === undefined || force === true)
        {
            room.memory.upgradeTrip = 2
                * this.avDistanceForm(room, FIND_SOURCES, room.controller.pos);
        }
        return  room.memory.upgradeTrip;
    },

    getBuilderRoundTripLength: function (room, force) {
        return this.getHarvestRoundTripLength(room, force);
    },

    getRepairerRoundTripLength: function (room, force) {
        return this.getHarvestRoundTripLength(room, force);
    },

    avDistanceBetweenObjects: function (room, objArray1, objArray2) {
        var distance = 0;
        var journeys = 0;
        for ( var i in objArray1 ) {
            for ( var j in objArray2 ) {
                var path = room.findPath(objArray1[i].pos, objArray2[j].pos,  {
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
        var distance = 0;
        var obj1s = room.find(findType1);
        if (obj1s.length > 0) {
            var obj2s = room.find(findType2);
            if (obj2s.length > 0) {
                return this.avDistanceBetweenObjects(room, obj1s, obj2s);
            }
        }
        return distance;
    },

    avDistanceFromObjects: function (room,objects,pos) {
        var distance = 0;
        var journeys = 0;
        for ( var i in objects ) {
            var path = room.findPath(objects[i].pos, pos, {
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
        var distance = 0;
        var objs = room.find(findType);
        if (objs.length > 0) {
            var journeys = 0;
            for ( var i in objs ) {
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
}

module.exports = rooms;