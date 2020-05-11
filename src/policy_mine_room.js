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
};

Policy.prototype.getSupplyRoom = function() {
    const values  = Game.flags[this.home][values];
    let bestProfit = 0;
    let bestRoom;
    for(let roomName in values) {
        const profit = getProfitRoom(room, values[roomName]);
        if (profit > bestProfit) {
            bestRoom = roomName;
        }
    }
    return bestRoom;
};

getProfitRoom = function(room, valueObj) {
    let budget = policy.getRoomEconomyPolicy(room.name).budget();
    valueNoRoad = getProfitRoomRoad(room, valueObj, budget, false);
    valueRoad = getProfitRoomRoad(room, valueObj, budget, true);
    if (!valueNoRoad) {
        return valueRoad ? valueRoad.value.profit : 0;
    }
    if (!valueRoad) {
        return valueNoRoad.value.profit;
    }
    if (valueNoRoad.value.profit > valueRoad.value.profit) {
        return valueNoRoad.value.profit
    }
    return valueRoad.value.profit;
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




Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;

// values[gc.ROOM_NEUTRAL][sources[i].id] = nnr;
// values[gc.ROOM_NEUTRAL]["parts"] += nnr.parts;
// values[gc.ROOM_NEUTRAL]["setup"] += nnr.startUpCost;
// values[gc.ROOM_NEUTRAL]["profit"] += nnr.netEnergy;



















