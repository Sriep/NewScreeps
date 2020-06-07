/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const economy = require("./economy");
const construction = require("./construction");
const cache = require("./cache");
//const gc = require("./gc");

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
        if (!Game.flags[roomName]) {
            const room = Game.rooms[roomName];
            if (room) {
                console.log("flagRoom start before create flag");
                const centre = new RoomPosition(25, 25, room.name);
                centre.createFlag(room.name);

                this.flagPermanents(room);
                //this.setSourceContainers(room);
                //this.setControllerContainers(room);
                //this.setMineralContainers(room);
                console.log("flagRoom finished", JSON.stringify(Game.flags[room.name].memory))
            }
        }
    },

    flagPermanents: function (room) {
        const m = {};

        const keeperLairs = room.find(C.FIND_STRUCTURES, {
            filter: { structureType: C.STRUCTURE_KEEPER_LAIR }
        });
        m.keeperLairs = keeperLairs.length > 0;

        const invaderCore = room.find(C.FIND_HOSTILE_STRUCTURES, {
            filter: { structureType: STRUCTURE_INVADER_CORE }
        });
        m.invaderCore = invaderCore.length > 0;

        const sources = room.find(C.FIND_SOURCES);
        if (sources.length > 0) {
            m.sources = {};
            for ( let source of sources ) {
                m.sources[source.id]= {
                    "ap" : economy.countAccessPoints(source.pos),
                    "energyCapacity" : source.energyCapacity,
                };
            }
            this.setSourceContainers(room, m)
        }

        if (room.controller) {
            m.controller = { "id" : room.controller.id };
            this.setControllerContainers(room, m)
        }

        const minerals = room.find(C.FIND_MINERALS);
        if (minerals.length > 0) {
            m.mineral = {
                "id" : minerals[0].id,
                "density" : minerals[0].density,
                "type":minerals[0].type,
            };
            this.setMineralContainers(room, m)
        }

        // temporary store double while refactoring
        //Game.flags[room.name].memory = m;
        Game.flags[room.name].memory.flagged = true;
        Game.flags[room.name].memory.local = JSON.stringify(m);
    },


    setMineralContainers : function(room, m) {
        //const m = Game.flags[room.name].memory;
        const minerals = room.find(C.FIND_MINERALS);
        if ( minerals.length > 1) {
            console.log("room", room.name, "minerals", JSON.stringify(minerals));
            gf.fatalError("room with more than one mineral")
        }
        const info = this.setContainerAndPosts(minerals[0], m.mineral);
        m.mineral["harvestPosts"] = cache.serialisePath(info["harvesterPosts"]);
        m.mineral["containerPos"] = cache.sPoint(info["containerPos"]);
    },

    setSourceContainers : function (room, m) {
        //const m = Game.flags[room.name].memory;
        const sources = room.find(C.FIND_SOURCES);
        for (let source of sources) {
            const info = this.setContainerAndPosts(source, m.sources[source.id]);
            m.sources[source.id]["harvestPosts"] = cache.serialisePath(info["harvesterPosts"]);
            m.sources[source.id]["containerPos"] = cache.sPoint(info["containerPos"]);
        }
    },

    setContainerAndPosts : function(obj) {
        let spots = economy.findMostFreeNeighbours(
            obj.room, obj.pos, 1
        );
        if (spots.length === 0) {
            return gf.fatalError("findMostFreeNeighbours cant get to source");
        }

        let containerIndex;
        for (let i in spots[0].neighbours) {
            if (spots[0].neighbours[i].x === spots[0].pos.x
                && spots[0].neighbours[i].y === spots[0].pos.y) {
                containerIndex = i;
            }
            spots[0].neighbours[i]["roomName"] = obj.room.name;
        }
        spots[0].neighbours.unshift(spots[0].neighbours.splice(containerIndex, 1)[0]);
        spots[0].pos.roomName = obj.room.name;
        return {"harvesterPosts": spots[0].neighbours, "containerPos" : spots[0].pos}
    },

    setControllerContainers : function (room, m) {
        //const m = Game.flags[room.name].memory;
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
        //console.log(spots.length, "setControllerContainers spots",JSON.stringify(spots))
        m.controller["containerPos"] = cache.serialisePath(spots);
        let uPosts = [];
        for (let spot of spots) {
            uPosts = uPosts.concat(spot.posts)
        }
        m.controller["upgradePosts"] = cache.serialisePath(uPosts);
        console.log("setControllerContainers uPosts", JSON.stringify(uPosts));
    },
};

module.exports = flag;


























