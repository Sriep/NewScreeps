/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const flag = require("flag");
const memory = require("memory");
const cache = require("cache");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_COLONIAL_OFFICE;
    this.id = id;
    this.m = data;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.myRooms = {};
    this.m.colonies = {};
    this.m.freeRooms = {};
    this.m.invaderRooms = {};
    this.m.foreignRooms = {};
    Memory.policyRates[this.id] = gc.COLONIAL_OFFICE_RATE;
    return true;
};

// runs once every tick
Policy.prototype.enact = function () {
    //if (Game.time + this.id % 5 !== 0) { // todo
    //    return
    //}
    //console.log("POLICY_COLONIAL_OFFICE");
    for (let flagName in Game.flags) {
        if (gf.validateRoomName(flagName)) {
            //console.log("POLICY_COLONIAL_OFFICE validated flagname", flagName);
            if (!Game.flags[flagName].memory.owned
                && !Game.flags[flagName].memory.spawnRoom) {
               this.checkRoom(flagName);
            }
        }
    }
};

Policy.prototype.checkRoom = function (roomName) {
    console.log("POLICY_COLONIAL_OFFICE checkroom", roomName);
    const m = Game.flags[roomName].memory;
    if (m.spawnRoom) {
        console.log("room",roomName,"already has spawn room");
        return;
    }
    if (!Game.rooms[roomName]) {
        console.log(roomName, "no room visablity");
        return;
    }

    let profitableRooms = [];
    for (let name in m.rooms) {
        const governor = policy.getGouvernerPolicy(name);
        //console.log("checkRoom name", name, "governor", JSON.stringify(governor));
        //console.log("checkRoom m.rooms[name]", JSON.stringify(m.rooms[name]));
        const values = memory.values(roomName, name);

        if (governor.m[gc.ACTIVITY_RESERVED_COLONIES]) {
            const profitParts = values["reserved"]["profit"]/values["reserved"]["parts"];
            if (profitParts > gc.COLONY_PROFIT_PART_MARGIN) {
                profitableRooms.push({
                    "governor":governor,
                    "profitParts":profitParts,
                    "info":values["reserved"]
                })
            }
        } else if (governor.m[gc.ACTIVITY_NEUTRAL_COLONIES]) {
            const profitParts = values["neutral"]["profit"]/values["reserved"]["parts"];
            //console.log("POLICY_COLONIAL_OFFICE m.rooms[name]", JSON.stringify(m.rooms[name]));
            //console.log("POLICY_COLONIAL_OFFICE values[neutral]", JSON.stringify(values["neutral"]));
            if ( profitParts > gc.COLONY_PROFIT_PART_MARGIN) {
                profitableRooms.push({
                    "governor":governor,
                    "profitParts":profitParts,
                    "info":values["neutral"]
                })
            }
        }
    }
    console.log("checkRoom profitableRooms",JSON.stringify(profitableRooms));
    profitableRooms = profitableRooms.sort( (a,b) =>  {
        return b["profitParts"] - a["profitParts"];
    });
    for (let roomInfo of profitableRooms) {
        if (roomInfo.governor.addColony(
            roomName,
            roomInfo.info.profit,
            roomInfo.info.parts,
            roomInfo.info.startUpCost,
        )) {
            m.spawnRoom = roomInfo.governor.roomName;
            build(Game.rooms[roomName], Game.rooms[m.spawnRoom], roomInfo.governor.m["reserved_colonies"]);
            break;
        }
    }
};

build = function(colony, spawnRoom, useRoad) {
    buildSourceSupport(colony, spawnRoom);
    if (useRoad) {
        buildRoads(colony, spawnRoom)
    }
};

buildSourceSupport = function(colony, spawnRoom) {
    console.log("buildSourceSupport colony", colony.name, "spawn room", spawnRoom.name);
    const roomFlag = flag.getRoomFlag(colony.name).memory;
    const sources = colony.find(FIND_SOURCES);
    for (let source of sources) {
        policy.buildSourceContainer(source);
        roomFlag.sources[source.id]["distance"] = cache.distanceSourceController(source, spawnRoom);
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
    return this
};

module.exports = Policy;






















































