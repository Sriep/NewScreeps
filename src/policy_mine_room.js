/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const policy = require("policy");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_MINE_ROOM;
    this.id = id;
    this.home = data.home;
    this.m = data.m;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    if (this.home) {
        delete this.m.home;
    }    
    return true;
};

// runs once every tick
Policy.prototype.enact = function () {
    return;
    if (this.m.spawnRoom) {
        return;
    }
    if (Game.time + this.id % gc.NEUTRAL_ROOM_CHECK_RATE !== 0 ) {
        return;
    }

    if (!Game.rooms[this.home]) {
        console.log("POLICY_MINE_ROOM enact no asset in room")
    }

    console.log("POLICY_MINE_ROOM enact home", JSON.stringify(this.home));

    const spawnInfo = this.getSpawnRoom();
    console.log("POLICY_MINE_ROOM spawnInfo", JSON.stringify(spawnInfo));
    if (!spawnInfo.name) {
        console.log("POLICY_MINE_ROOM enact no spawnInfo",JSON.stringify(spawnInfo));
        return;
    }
    this.m.spawnRoom = spawnInfo.name;
    const governor = policy.getGouvernerPolicy(spawnInfo.name);
    console.log("POLICY_MINE_ROOM about to call addColony");
    governor.addColony(this.home, spawnInfo.profit, spawnInfo.parts);
    build(Game.rooms[this.home], Game.rooms[this.m.spawnRoom], spawnInfo.road);
};

Policy.prototype.getSpawnRoom = function() {
    const values = JSON.parse(Game.flags[this.home].memory["values"]);
    console.log(this.home,"POLICY_MINE_ROOM getSpawnRoom values",Game.flags[this.home].memory["values"]);
    let bestProfit = 0;
    let bestRoom;
    let useRoad;
    let bestParts;
    for(let roomName in values) {
        const roomInfo = this.getProfitRoom(Game.rooms[roomName], values[roomName]);
        console.log(this.home,"POLICY_MINE_ROOM getProfitRoom", JSON.stringify(roomInfo));
        if (roomInfo && roomInfo.profit > bestProfit) {
            bestProfit = roomInfo.profit;
            useRoad = roomInfo.road;
            bestRoom = roomName;
            bestParts = roomInfo.parts
        }
    }
    return { "name" : bestRoom, "road": useRoad, "profit": bestProfit, "parts" : bestParts } ;
};

Policy.prototype.getProfitRoom = function(room, valueObj) {
    console.log(this.home,"POLICY_MINE_ROOM getProfitRoom");
    let budget = policy.getGouvernerPolicy(room.name).budget();
    console.log(this.home,"POLICY_MINE_ROOM getGouvernerPolicy budget", JSON.stringify(budget));
    if (!budget["support_colonies"]) {
        return
    }
    const valueNoRoad = this.getProfitRoomRoad(room, valueObj, budget, false);
    const valueRoad = this.getProfitRoomRoad(room, valueObj, budget, true);
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

Policy.prototype.getProfitRoomRoad = function(room, valueObj, budget, useRoad) {
    console.log(this.home,"POLICY_MINE_ROOM getProfitRoomRoad home budget",budget,"useRoad", useRoad, "valueObj", valueObj);
    let value;
    if (room.controller.level <= 2) {
        if (!useRoad) {
            value = valueObj[gc.ROOM_NEUTRAL];
        } else {
            return undefined;
        }
    } else if (room.controller.level > 3) {
        value = valueObj[useRoad ? gc.ROOM_RESERVED_ROADS : gc.ROOM_RESERVED];
    }
    if (!budget.parts || value.parts >= budget.parts) {
        console.log("getProfitRoom fail; budget.parts", budget.parts, "value.parts", value.parts);
        return undefined;
    }
    const energyLeft = room.controller.progressTotal - room.controller.progress;
    const ltToNextLevel = energyLeft / budget.net_energy;
    const ltToPayOff = value.startUpCost / value.profit;
    if ( ltToNextLevel < ltToPayOff ) {
        console.log(this.home, "POLICY_MINE_ROOM getProfitRoom faile ltToNextLevel",ltToNextLevel,"ltToPayOff",ltToPayOff);
        return undefined;
    }
    console.log(this.home,"POLICY_MINE_ROOM getProfitRoom ok ok ok ok oko ko ko ko ko ko kok ok oko ko ko ko ko ko k");
    console.log(this.home,"POLICY_MINE_ROOM getProfitRoom ok",JSON.stringify({"useRoad" : useRoad, "parts" : value.parts,"value": value }));
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
    if (!this.home) {
        console.log("draftReplacment POLICY_MINE_ROOM home",this.home,"this", JSON.stringify(this));
        gf.fatalError("this.home should be defined");
        return false;
    }
    for ( let id in Memory.policies) {
        if (Memory.policies[id].type === gc.POLICY_MINE_ROOM
            && id !== this.id
            && Memory.policies[id].m.home === this.home) {
            console.log("draftReplacment POLICY_MINE_ROOM",this.home,"return false this", JSON.stringify(this));
            gf.fatalError("there should not be any repeats");
            return false;
        }
    }
    //console.log("draftReplacment POLICY_MINE_ROOM",this.home,"return this", JSON.stringify(this));
    return this
};

module.exports = Policy;






































