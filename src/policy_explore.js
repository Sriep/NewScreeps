/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */
const budget = require("budget");
const race = require("race");
//onst gf = require("gf");
const gc = require("gc");
const flag = require("flag");
const policy = require("policy");

function PolicyExplore  (id, data) {
    this.id = id;
    this.type = gc.POLICY_EXPLORE;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data;
}

PolicyExplore.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    this.m.direction = TOP;
    return true;
};

PolicyExplore.prototype.enact = function () {
    if (!this.m.direction) {
        this.m.direction = TOP;
    }
    const creeps = policy.getCreeps(this.id, gc.RACE_SCOUT);
    //console.log("POLICY_EXPLORE creeps", creeps.length,"m",JSON.stringify(this.m));
    if (creeps.length < gc.EXPLORE_CREEPS) {
        const orders = flag.getSpawnQueue(this.home).orders(this.id);
        if (creeps.length + orders.length < gc.EXPLORE_CREEPS) {
           //console.log("POLICY_EXPLORE sending new explorer currently",creeps.length,"plus",orders.length,"explorers out there" );
           this.sendExplorers(gc.EXPLORE_CREEPS - creeps.length -  orders.length)
        }
    }
    //console.log("enact explore policy", creeps.length, "creeps exploring this", JSON.stringify(this));
    for (let i in creeps) {
           this.exploreRoom(creeps[i].room.name);
    }
};

PolicyExplore.prototype.exploreRoom = function(newRoom) {
    const room = Game.rooms[newRoom];
    if (!room) {
        //console.log("POLICY_EXPLORE !Game.rooms[newRoom] no sight on room");
        return;
    }
    if (!room.controller) {
        //console.log("POLICY_EXPLORE !room.controller");
        return;
    }
    if (room.controller.my) {
        //console.log("POLICY_EXPLORE room.controller.my");
        return;
    }

    if (room.controller.owner
        && room.controller.owner.username.length > 0) {
        //console.log("POLICY_EXPLORE !room.controller.owner.username.length > 0");
        return;
    }

    if (room.controller.reservation
        && room.controller.reservation.username.length > 0) {
        //console.log("POLICY_EXPLORE !room.controller.reservation.username.length > 0");
        return;
    }

    let roomFlag = flag.getRoomFlag(newRoom);
    if (!roomFlag) {
        gf.fatalError("should have room flag room " + newRoom);
    }
    if (roomFlag.memory.explored ) {
        return;
    }
    roomFlag.memory.explored = true;
    if (!roomFlag.memory.rooms) {
        roomFlag.memory.rooms = {};
    }
    for (let name in Game.rooms) {
        const room = Game.rooms[name];
        //console.log("POLICY_EXPLORE", room,"room.controller",room.controller,room.controller.my, room.controller.level > 1)
        if (!!room.controller && room.controller.my && room.controller.level > 1) {
            const value = budget.valueNeutralRoom(newRoom, name, false);
            //console.log("value[gc.ROOM_NEUTRAL]",JSON.stringify(value[gc.ROOM_NEUTRAL]));
            if (value[gc.ROOM_NEUTRAL].profit > 0
                || value[gc.ROOM_RESERVED_ROADS].profit > 0
                || value[gc.ROOM_OWNED].profit > 0) {
                if (!roomFlag.memory.rooms[name]) {
                    roomFlag.memory.rooms[name] = {}
                }
                roomFlag.memory.rooms[name]["values"] = JSON.stringify(value);
                roomFlag.memory.rooms[name]["neutral"] = {"profit": value[gc.ROOM_NEUTRAL].profit, "parts": value[gc.ROOM_NEUTRAL].parts};
                roomFlag.memory.rooms[name]["reserved"] = {"profit": value[gc.ROOM_RESERVED_ROADS].profit, "parts": value[gc.ROOM_RESERVED_ROADS].parts};
                roomFlag.memory.rooms[name]["owned"] =  {"profit": value[gc.ROOM_OWNED].profit, "parts": value[gc.ROOM_OWNED].parts};
            }
        }
    }

    const colonialOffice = policy.getPolicyByType(gc.POLICY_COLONIAL_OFFICE);
    if (colonialOffice) {
        colonialOffice.checkRoom(newRoom);
    }
    //undefined.break;
};

PolicyExplore.prototype.sendExplorers = function(shortfall) {
    console.log("sendExplorers shortfall", shortfall,"this.m.direction",this.m.direction);
    for (let i = 0; i < shortfall; i++) {
        const data = {
            "body": race.body(gc.RACE_SCOUT, BODYPART_COST[MOVE]),
            "opts": {"memory": {
                "home" : this.roomName,
                "direction" : this.m.direction,
            }},
            "name": gc.RACE_SCOUT + "_50",
        };
        console.log("sendExplorers data",JSON.stringify(data));
        flag.getSpawnQueue(this.home).addSpawn(
            data,
            gc.SPAWN_PRIORITY_MISC,
            this.id,
            gc.STATE_SCOUT_IDLE,
        );
        this.m.direction = (this.m.direction+2) % 8;
    }
};

PolicyExplore.prototype.draftReplacment = function() {
    return Game.map.describeExits(this.home) ? this : false;
};

module.exports = PolicyExplore;





































