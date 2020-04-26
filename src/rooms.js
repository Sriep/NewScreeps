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
    }
}

module.exports = rooms;