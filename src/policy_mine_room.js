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
    //this.home = data.home;
    this.m = data;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    return true;
};

// runs once every tick
Policy.prototype.enact = function () {
    //console.log("POLICY_MINE_ROOM room", JSON.stringify(this.m.home))
    if (this.m.spawnRoom) {
        return;
    }
    if (Game.time + this.id % gc.NEUTRAL_ROOM_CHECK_RATE !== 0 ) {
        return;
    }
    const spawnInfo = this.getSpawnRoom();
    if (!spawnInfo.name) {
        return;
    }

    this.m.spawnRoom = spawnInfo.name;
    const governor = policy.getGouvernerPolicy(this.m.spawnRoom.name);
    governor.addColony(this.m.home, spawnInfo.profit, spawnInfo.parts);
    build(Game.rooms[this.m.home], Game.rooms[this.m.spawnRoom], spawnInfo.road);
};

Policy.prototype.getSpawnRoom = function() {
    const values = JSON.parse(Game.flags[this.m.home].memory[values]);
    console.log("getSpawnRoom values",JSON.stringify(values));
    let bestProfit = 0;
    let bestRoom;
    let useRoad;
    let bestParts;
    for(let roomName in values) {
        const roomInfo = getProfitRoom(Game.rooms[roomName], values[roomName]);
        if (roomInfo && roomInfo.profit > bestProfit) {
            bestProfit = roomInfo.profit;
            useRoad = roomInfo.road;
            bestRoom = roomName;
            bestParts = roomInfo.parts
        }
    }
    return { "name" : bestRoom, "road": useRoad, "profit": bestProfit, "parts" : bestParts } ;
};

getProfitRoom = function(room, valueObj) {
    let budget = policy.getGouvernerPolicy(room.name).budget();
    if (!budget["support_colonies"]) {
        return
    }
    const valueNoRoad = getProfitRoomRoad(room, valueObj, budget, false);
    const valueRoad = getProfitRoomRoad(room, valueObj, budget, true);
    if (!valueNoRoad) {
        return valueRoad ? { "profit": valueRoad.value.profit, "road": true, "parts" :  valueRoad.value.parts} : 0;
    }
    if (!valueRoad) {
        return { "profit": valueNoRoad.value.profit, "road": false, "parts" :  valueNoRoad.value.parts} ;
    }
    if (valueNoRoad.value.profit > valueRoad.value.profit) {
        return { "profit": valueNoRoad.value.profit, "road": false , "parts" :  valueNoRoad.value.parts}
    }
    return { "profit" : valueRoad.value.profit, "road" : true, "parts" :  valueRoad.value.parts }  ;
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
    return {"value": value, "useRoad" : useRoad, "parts" : value.parts};
};

build = function(colony, spawnRoom, useRoad) {
    buildSourceSupport(colony);
    if (useRoad) {
        buildRoads(colony, spawnRoom)
    }
};

buildSourceSupport = function(colony) {
    const sources = colony.find(FIND_SOURCES);
    for (let source of sources) {
        let sourceFlag = Game.flags[sorce.id];
        if (!sourceFlag) {
            source.pos.createFlag(sorce.id, gc.FLAG_PERMANENT_COLOUR, gc.FLAG_SOURCE_COLOUR)
        }
        let spots = economy.findMostFreeNeighbours(
            source.room, source.pos, 1
        );
        sourceFlag.memory.harvesterPosts = spots[0].neighbours;
        spots[0].pos.roomName = source.room.name;
        sourceFlag.memory.containerPos = spots[0].pos;
        const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
        if (result !== OK) {
            gf.fatalError("construction failed " + result.toString(),"pos", JSON.stringify(spots[0].pos));
        }
    }
};

buildRoads = function(colony, spawnRoom) {
    const spawns = spawnRoom.find(FIND_MY_SPAWNS);
    const sources = colony.find(FIND_SOURCES);
    for (let source of sources) {
        const pathInfo = cache.path(souce, spawns, "spawn", 1, true);
        for (let pathPos of pathInfo) {
            pos = gf.roomPosFromPos(pathPos);
            pos.createConstructionSite(STRUCTURE_ROAD)
        }
    }
};

Policy.prototype.draftReplacment = function() {
    //return false;
    for ( let id in Memory.policies) {
        if (Memory.policies[id].type === gc.POLICY_MINE_ROOM
            && Memory.policies[id].m.home === this.m.home) {
            return false;
        }
    }
    return this
};

module.exports = Policy;






































