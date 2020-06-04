/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const economy = require("./economy");
const construction = require("./construction");
const gc = require("./gc");

const flag = {

    getRoom(roomName) {
        this.flagRoom(roomName);
        const flagRoom = require("flag_room");
        return new flagRoom.FlagRooom(roomName);
    },

    getRoomFlag(roomName) {
        let roomFlag = Game.flags[roomName];
        if (!roomFlag) {
            this.flagRoom(roomName);
            roomFlag = Game.flags[roomName]
        }
        return roomFlag;
    },

    getFlag(obj) {
        let objFlag = Game.flags[obj.id];
        if (!objFlag) {
            obj.pos.createFlag(obj.id);
            objFlag = Game.flags[obj.id];
            Game.flags[obj.id].memory.state = obj.structureType + "_idle"
        }
        return objFlag;
    },

    getSpawnQueue(roomName) {
        const QueueSpawn = require("queue_spawn");
        return new QueueSpawn(roomName);
    },

    flagRoom: function (roomName) {
        //console.log("flagRoom", roomName,"Game.flags[roomName]",Game.flags[roomName]);
        if (!Game.flags[roomName]) {
            const room = Game.rooms[roomName];
            //console.log("flagRoom room", room.name);
            if (room) {
                const centre = new RoomPosition(25, 25, room.name);
                centre.createFlag(room.name);

                this.flagPermanents(room);
                this.setSourceContainers(room);
                this.setControllerContainers(room);
                this.setMineralContainers(room);
            }
        }
    },

    flagPermanents: function (room) {
        //console.log("flagPermanents", room.name);
        const m = Game.flags[room.name].memory;

        const keeperLairs = room.find(C.FIND_STRUCTURES, {
            filter: { structureType: C.STRUCTURE_KEEPER_LAIR }
        });
        m.keeperLairs = keeperLairs.length > 0;

        const invaderCore = room.find(C.FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_INVADER_CORE }
        });
        m.invaderCore = invaderCore.length > 0;

        const sources = room.find(C.FIND_SOURCES);
        //console.log("flag sources", sources);
        if (sources.length > 0) {
            m.sources = {};
            for ( let source of sources ) {
                m.sources[source.id]= {
                    "ap" : economy.countAccessPoints(source.pos),
                    "distance" : 15,//cache.distanceSourceSpawn(source, room, false) todo fix
                };
                source.pos.createFlag(source.id, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_SOURCE_COLOUR);
            }
        }
        //console.log("flag controller", room.controller);
        if (room.controller) {
            m.controller = { "id" : room.controller.id };
            room.controller.pos.createFlag(room.controller.id, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_CONTROLLER_COLOUR);
        }

        const minerals = room.find(C.FIND_MINERALS);
        if (minerals.length > 0) {
            m.mineral = {
                "id" : minerals[0].id,
                "type":minerals[0].type,
                "distance" : 15,//.distanceSourceSpawn(minerals[0], room, false) todo fix
            }
        }

        m.flagged = true;
/*
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
    },


    setMineralContainers : function(room) {
        //console.log("setMineralContainers", room.name);
        const m = Game.flags[room.name].memory;
        const minerals = room.find(C.FIND_MINERALS);
        if ( minerals.length > 1) {
            console.log("room", room.name, "minerals", JSON.stringify(minerals));
            gf.fatalError("room with more than one mineral")
        }
        this.setContainerAndPosts(minerals[0], m.mineral)
    },

    setSourceContainers : function (room) {
        //console.log("setSourceContainers", room.name);
        const m = Game.flags[room.name].memory;
        const sources = room.find(C.FIND_SOURCES);
        for (let source of sources) {
            this.setContainerAndPosts(source, m.sources[source.id])
        }
    },

    setContainerAndPosts : function(obj, memoryObj) {
        //console.log("setContainerAndPosts", obj);
        let spots = economy.findMostFreeNeighbours(
            obj.room, obj.pos, 1
        );
        if (spots.length === 0) {
            return gf.fatalError("findMostFreeNeighbours cant get to source");
        }

        let containerIndex;
        //console.log("setContainerAndPosts neighbours before", JSON.stringify(spots[0].neighbours));
        for (let i in spots[0].neighbours) {
            if (spots[0].neighbours[i].x === spots[0].pos.x
                && spots[0].neighbours[i].y === spots[0].pos.y) {
                containerIndex = i;
            }
            spots[0].neighbours[i]["roomName"] = obj.room.name;
        }
        spots[0].neighbours.unshift(spots[0].neighbours.splice(containerIndex, 1)[0]);
        //console.log("setContainerAndPosts neighbours after", JSON.stringify(spots[0].neighbours));
        //console.log("setContainerAndPosts memoryObj", JSON.stringify(memoryObj));
        memoryObj["harvesterPosts"] =  spots[0].neighbours;
        //console.log("setContainerAndPosts harvesterPosts", JSON.stringify(harvesterPosts));
        spots[0].pos.roomName = obj.room.name;
        //console.log("setContainerAndPosts containerPos", JSON.stringify(containerPos));
        memoryObj["containerPos"] = spots[0].pos;
        //console.log("setContainerAndPosts finish");
    },

    setControllerContainers : function (room) {
        //console.log("setControllerContainers", room.name);
        const m = Game.flags[room.name].memory;
        const terrain = room.getTerrain();
        let spots = construction.coverArea(room.controller.pos, 3, terrain);
        if (spots.length === 0) {
            return gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS findMostFreeNeighbours cant get to controller");
        }
        for (let spot of spots) {
            spot.posts = spot.posts.sort( (p1, p2) => {
                return room.controller.pos.getRangeTo(p1.x, p1.y) - room.controller.pos.getRangeTo(p2.x, p2.y)
            });
            spot["roomName"] = room.name;
        }
        m.controller["upgraderPosts"] = spots;
    },
};

module.exports = flag;


























