/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const flag = require("flag");

const rs = Object.freeze({
   "Free" : "free",
   "Colony" : "colony",
   "My" : "my",
   "Foreign" : "foreign",
   "ForeignColony" : "foreign_colony",
   "Invader" : "invader",
   "InvaderColony" : "invader_colony",
   "SourceKeeper" : "source_keeper",
});

getStatus = function(controller) {
    if (controller.my) {
        return contoller.level>1 ? rs.My : rs.Colony;
    }


};

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
    return true;
};

// runs once every tick
Policy.prototype.enact = function () {
    console.log("POLICY_COLONIAL_OFFICE");
    for (let flagName in Game.flags) {
        if (gf.validateRoomName(flagName)) {
            console.log("POLICY_COLONIAL_OFFICE validated flagname", flagName);
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
    let profitableRooms = [];
    for (let name in m.rooms) {
        const governor = policy.getGouvernerPolicy(name);
        console.log("checkRoom name", name, "governor", JSON.stringify(governor));
        console.log("checkRoom m.rooms[name]", JSON.stringify(m.rooms[name]));
        if (governor.m[gc.ACTIVITY_RESERVED_COLONIES]) {
            const profitParts = m.rooms[name]["reserved"]["profit"]/m.rooms[name]["reserved"]["parts"];
            if (profitParts > gc.COLONY_PROFIT_PART_MARGIN) {
                profitableRooms.push({"governor":governor, "profitParts":profitParts, "info":m.rooms[name]["reserved"]})
            }
        } else if (governor.m[gc.ACTIVITY_NEUTRAL_COLONIES]) {
            const profitParts = m.rooms[name]["neutral"]["profit"]/m.rooms[name]["reserved"]["parts"];
            if ( profitParts > gc.COLONY_PROFIT_PART_MARGIN) {
                profitableRooms.push({"governor":governor, "profitParts":profitParts,"info":m.rooms[name]["neutral"] })
            }
        }
    }
    console.log("checkRoom profitableRooms",JSON.stringify(profitableRooms));
    profitableRooms = profitableRooms.sort( (a,b) =>  {
        return b["profitParts"] - a["profitParts"];
    });
    for (let roomInfo of profitableRooms) {
        if (roomInfo.governor.addColony(roomInfo.name, roomInfo.info.profit, roomInfo.info.parts)) {
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






















































