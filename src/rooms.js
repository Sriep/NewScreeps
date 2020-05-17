/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const economy = require("economy");

const rooms = {

    flag: function (room) {
        if (!Game.flags[room.name]) {
            const center = new RoomPosition(25, 25, room.name);
            center.createFlag(room.name);
        }
        let myRoom = room.controller && room.controller.my && room.controller.level > 0;
        this.flagPermanents(room);
        if (myRoom) {
            this.flagMyRoomStructures(room);
        }
    },

    flagPermanents: function (room) {
        //console.log("room flag permanents room",room.name)
        const m = Game.flags[room.name].memory;

        const keeperLairs = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_KEEPER_LAIR }
        });
        m.keeperLairs = keeperLairs.length > 0;

        const invaderCore = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_INVADER_CORE }
        });
        m.invaderCore = invaderCore.length > 0;

        const sources = room.find(FIND_SOURCES);
        if (sources.length > 0) {
            m.sources = [];
            for ( let source of sources ) {
                m.sources.push(source.id)
            }
        }

        if (room.controller) {
            m.controller = room.controller.id;
        }
/*
        const minerals = room.find(FIND_MINERALS);
        if (minerals.length > 0) {
            m.mineral = [];
            for (let mineral of minerals ) {
                m.mineral.push({"id" : mineral.id, "type":mineral.type})
            }
        }

        const powerBank = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_POWER_BANK }
        });
        m.powerBank = powerBank.length > 0;

        for ( i in keeperLairs ) {
            flagName = keeperLairs[i].id;
            if (!Game.flags[flagName])
                {
                    keeperLairs[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_KEEPERS_LAIR_COLOUR);
                }
            Game.flags[flagName].memory.type = gc.FLAG_KEEPERS_LAIR;
            Game.flags[flagName].memory.keeperLairRoom = true;
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
                {
                    portals[i].pos.createFlag(flagName, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_PORTAL_COLOUR);
                }
            Game.flags[flagName].memory.type = gc.FLAG_PORTAL;
            Game.flags[flagName].memory.destination = portals[i].destination;
            if (portals[i].ticksToDecay)
                {
                    Game.flags[flagName].memory.decay = Game.time + portals[i].ticksToDecay;
                }
        }
*/
        m.flagged = true;
    },

    flagMyRoomStructures: function (room) {
        const sources = room.find(FIND_SOURCES);
        for ( let source of sources ) {
            if (!Game.flags[source.id]) {
                source.pos.createFlag(source.id, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_SOURCE_COLOUR);
                //Game.flags[source.id].memory.type = gc.FLAG_SOURCE;
                //Game.flags[source.id].memory.resourceType = RESOURCE_ENERGY;
                //Game.flags[source.id].memory.energyCapacity = sources[i].energyCapacity;
                Game.flags[source.id].memory.accessPoints = economy.countAccessPoints(source.pos);
            }
            console.log("flagged souce", source.id,"ap", Game.flags[source.id].accessPoints)
        }

        if (room.controller) {
            if (!Game.flags[room.controller.id])
            {
                room.controller.pos.createFlag(room.controller.id, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_CONTROLLER_COLOUR);
                //Game.flags[room.controller.id].memory.type = gc.FLAG_CONTROLLER;
            }
        }

        const minerals = room.find(FIND_MINERALS);
        for (let mineral of minerals ) {
            if (!Game.flags[mineral.id])
            {
                mineral.pos.createFlag(mineral.id, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_MINERAL_COLOUR);
                //Game.flags[mineral.id].memory.type = gc.FLAG_MINERAL;
                //Game.flags[mineral.id].memory.resourceType = minerals[i].mineralType;
            }
        }

        /*
        console.log("room flagMyRoomStructures room",room.name);
        const links = room.find(FIND_STRUCTURES, {
            filter: function(struc) {
                return struc.structureType === STRUCTURE_LINK;
            }
        });
        for ( let i = 0 ; i < links.length ; i++ ) {
            const flagName = links[i].id;
            if (!Game.flags[flagName])
                {
                    links[i].pos.createFlag(flagName, gc.FLAG_STRUCTURE_COLOUR, gc.FLAG_LINK_COLOUR);
                }
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
                {
                    labs[i].pos.createFlag(flagName, gc.FLAG_LAB_COLOUR, gc.FLAG_LAB_COLOUR);
                }
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
                {
                    tarminals[i].pos.createFlag(flagName, gc.FLAG_STRUCTURE_COLOUR, gc.FLAG_TERMINAL_COLOUR);
                }
            Game.flags[flagName].memory.type = gc.FLAG_TERMINAL;
        }
        */
    }
};

module.exports = rooms;