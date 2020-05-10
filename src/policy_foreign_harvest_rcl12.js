/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_FOREIGN_MINING;
    this.id = id;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    return true;
};

// runs once every tick
Policy.prototype.enact = function () {
    console.log("POLICY_FOREIGN_HARVEST_RCL12 enact");
    const spawnPartsAvailable = freeSpawnTimeLt(this.parentId, this.home);
    if (spawnPartsAvailable < gc.SPAWN_TIME_RESERVE) {
        return;
    }
    const mindedRooms = minedRooms();
    let roomValues = [];
    for (let flagName in Game.flags) {
        if (!gf.validateRoomName(flagName)) {
            continue;
        }
        if (!Game.flags[flagName].values) {
            continue;
        }
        if (mindedRooms.includes(flagName)) {
            continue;
        }
        const values = Game.flags[flagName].values[gc.ROOM_NEUTRAL]["profit"];
        roomValues.push = { "name" : flagName, "profit" :  values.profit };
    }
    roomValues = roomValues.sort( function (a,b)  {
        return b.profit - a.profit;
    });
    console.log("roomValues", JSON.stringify(roomValues));
    if (roomValues[0].profit > gc.MIN_ENERGY_TO_MINE) {
        policy.activatePolicy(gc.POLICY_MINE_ROOM, {
            "home" : roomValues[0].flagName,
        }, undefined);
    }
};

minedRooms = function() {
    const mindedRooms = [];
    for (let id in Memory.polices) {
        if (Memory.policies[id].type === gc.POLICY_MINE_ROOM) {
            mindedRooms.push(Memory.policies[id].type.home);
        }
    }
    return mindedRooms;
};

freeSpawnTimeLt = function (parentId, home) {
    let reservedPartsLt;
    policy.iterateChildren(this.parentId, function(policy) {
        if (policy.budget) {
            reservedPartsLt += policy.budget().parts;
        }
    });
    const partsLt = room.find(FIND_MY_SPAWNS).length * CREEP_LIFE_TIME / CREEP_SPAWN_TIME;
    return partsLt - reservedPartsLt;
};



Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;































