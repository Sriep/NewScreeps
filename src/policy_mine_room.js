/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_MINE_ROOM;
    this.id = id;
    this.home = data.home;
    this.m = data;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    return true;
};

// runs once every tick
Policy.prototype.enact = function () {
    if (this.m.spawnRoom) {
        return;
    }
    if (Game.time + this.id % gc.NEUTRAL_ROOM_CHECK_RATE !== 0 ) {
        return;
    }
    const miningInfo = this.getSpawnRoom();
    this.m.spawnRoom= miningInfo.name;
    if (!this.m.spawnRoom) {
        return;
    }
    const governor = policy.getGouvernerPolicy(this.m.spawnRoom.name);
    governor.addColoney(this.home);
    if (miningInfo.road) {
        buildRoads(this.home, this.m.spawnRoom);
    }
};

Policy.prototype.getSpawnRoom = function() {
    const values  = Game.flags[this.home][values];
    let bestProfit = 0;
    let bestRoom;
    let useRoad = false;
    for(let roomName in values) {
        const roomBest = getProfitRoom(room, values[roomName]).profit;
        const profit = roomBest.profit;
        useRoad = roomBest.road;
        if (profit > bestProfit) {
            bestRoom = roomName;
        }
    }
    return { "name" : bestRoom, "road": useRoad } ;
};

getProfitRoom = function(room, valueObj) {
    let budget = policy.getRoomEconomyPolicy(room.name).budget();
    valueNoRoad = getProfitRoomRoad(room, valueObj, budget, false);
    valueRoad = getProfitRoomRoad(room, valueObj, budget, true);
    if (!valueNoRoad) {
        return valueRoad ? { "profit": valueRoad.value.profit, "road": true} : 0;
    }
    if (!valueRoad) {
        return { "profit": valueNoRoad.value.profit, "road": false } ;
    }
    if (valueNoRoad.value.profit > valueRoad.value.profit) {
        return { "profit": valueNoRoad.value.profit, "road": false }
    }
    return { "profit" : valueRoad.value.profit, "road" : true }  ;
};

getProfitRoomRoad = function(room, valueObj, budget, useRoad) {
    let value;
    if (room.controller.level <= 2) {
        value = valueObj[useRoad ? gc.ROOM_NEUTRAL_ROADS  : gc.ROOM_NEUTRAL];
    } else if (room.controller.level > 3) {
        value = valueObj[useRoad ? gc.ROOM_RESERVED_ROADS : gc.ROOM_RESERVED];
    }
    if (!budget.parts || value.parts >= budget.parts) {
        return undefined;
    }
    const energyLeft = room.controller.progressTotal - room.controller.progress;
    const ltToNextLevel = energyLeft / budget.net_energy;
    const ltToPayOff = value.startUpCost / value.profit;
    if ( ltToNextLevel < ltToPayOff ) {
        return undefined;
    }
    return {"value": value, "useRoad" : useRoad, };
};

buildRoads = function(colony, spawnRoom) {
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;




















