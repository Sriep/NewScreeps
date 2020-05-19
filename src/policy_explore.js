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

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_EXPLORE;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    this.m.direction = TOP;

    return true;
};

Policy.prototype.enact = function () {
    const creeps = policy.getCreeps(this.id, gc.RACE_SCOUT);
    //console.log("POLICY_EXPLORE creeps", creeps.length);
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

Policy.prototype.exploreRoom = function(newRoom) {
    let roomFlag = flag.getRoomFlag(newRoom);
    if (!roomFlag) {
        gf.fatalError("should have room flag room " + newRoom);
    }
    const M = roomFlag.memory;
    if (M.explored ) {
        return;
    }
    M.explored = true;
    if (!Game.rooms[newRoom].controller) {
        return;
    }
    if (Game.rooms[newRoom].controller.my) {
        return;
    }

    if (!M.rooms) {
        M.rooms = {};
    }
    for (let name in Game.rooms) {
        const room = Game.rooms[name];
        if (!!room.controller && room.controller.my && room.controller.level > 1) {
            const value = budget.valueNeutralRoom(newRoom, name, false);
            if (value[gc.ROOM_NEUTRAL].profit > 0
                || value[gc.ROOM_RESERVED_ROADS].profit > 0
                || value[gc.ROOM_OWNED].profit > 0) {
                if (!M.rooms[name]) {
                    M.rooms[name] = {}
                }
                M.rooms[name]["values"] = JSON.stringify(value);
                M.rooms[name]["neutral"] = {"profit": value[gc.ROOM_NEUTRAL].profit, "parts": value[gc.ROOM_NEUTRAL].parts};
                M.rooms[name]["reserved"] = {"profit": value[gc.ROOM_RESERVED_ROADS].profit, "parts": value[gc.ROOM_RESERVED_ROADS].parts};
                M.rooms[name]["owned"] =  {"profit": value[gc.ROOM_OWNED].profit, "parts": value[gc.ROOM_OWNED].parts};
            }
        }
    }

};

Policy.prototype.sendExplorers = function(shortfall) {
    for (let i = 0; i < shortfall; i++) {
        const data = {
            "body": race.body(gc.RACE_SCOUT, BODYPART_COST[MOVE]),
            "opts": {"memory": {
                "home" : this.roomName,
                "direction" : this.m.direction,
            }},
            "name": gc.RACE_SCOUT + "_50",
        };
        flag.getSpawnQueue(this.home).addSpawn(
            data,
            gc.SPAWN_PRIORITY_MISC,
            this.id,
            gc.STATE_SCOUT_IDLE,
        );
        this.m.direction = (this.m.direction+2) % 8;
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;





































