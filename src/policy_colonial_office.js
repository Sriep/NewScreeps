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
function PolicyColonialOffice  (id, data) {
    this.type = gc.POLICY_COLONIAL_OFFICE;
    this.id = id;
    this.m = data.m;
}

// runs first time policy is created only
PolicyColonialOffice.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.myRooms = {};
    this.m.colonies = {};
    this.m.freeRooms = {};
    this.m.invaderRooms = {};
    this.m.foreignRooms = {};
    this.m.underConstruction = [];
    Memory.policyRates[this.id] = gc.COLONIAL_OFFICE_RATE;
    return true;
};

// runs once every tick
PolicyColonialOffice.prototype.enact = function () {
    this.lookForNewColonies();
};

PolicyColonialOffice.prototype.lookForNewColonies = function () {
    for (let flagName in Game.flags) {
        if (gf.validateRoomName(flagName)) {
            if (!Game.flags[flagName].memory.owned
                && !Game.flags[flagName].memory.spawnRoom) {
                this.checkRoom(flagName);
            }
        }
    }
    if (!this.m.underConstruction) { // todo hack remove next time
        this.m.underConstruction = [];
    }
    for (let i  = this.m.underConstruction.length ;  i >= 0 ; i--) {
        if (Game.rooms[this.m.underConstruction[i]]) {
            //const roomFlag = flag.getRoomFlag(this.m.underConstruction[i]);
            console.log("POLICY_COLONIAL_OFFICE underContruction", this.m.underConstruction[i]);
            //this.build(this.m.underConstruction[i], roomFlag.memory.spawnRoom, false)
            this.build(this.m.underConstruction[i], "W7N7", false); // todo hack remove line
            this.m.underConstruction.splice(i,1);
        }
    }
};

PolicyColonialOffice.prototype.checkRoom = function (roomName) {
    //console.log("POLICY_COLONIAL_OFFICE checkroom", roomName);
    const m = flag.getRoomFlag(roomName).memory;// Game.flags[roomName].memory;
    //console.log("POLICY_COLONIAL_OFFICE checkroom m", JSON.stringify(m), "again", JSON.stringify(Game.flags[roomName].memory));
    //m.test = "testing piers";
    //console.log("POLICY_COLONIAL_OFFICE checkroom testing",roomName, "m", JSON.stringify(m));

    if (m.spawnRoom) {
        //console.log("POLICY_COLONIAL_OFFICE checkRoom room",roomName,"already has spawn room");
        return;
    }

    let profitableSpawnRooms = [];
    for (let name in m.rooms) {
        const governor = policy.getGouvernerPolicy(name);
        //console.log("checkRoom name", name, "governor", JSON.stringify(governor));
        //console.log("checkRoom m.rooms[name]", JSON.stringify(m.rooms[name]));
        const values = memory.values(roomName, name);

        if (governor.m[gc.ACTIVITY_RESERVED_COLONIES]) {
            //console.log("POLICY_COLONIAL_OFFICE ACTIVITY_RESERVED_COLONIES");
            const profitParts = values["reserved"]["profit"]/values["reserved"]["parts"];
            if (profitParts > gc.COLONY_PROFIT_PART_MARGIN) {
                profitableSpawnRooms.push({
                    "governor":governor,
                    "profitParts":profitParts,
                    "info":values["reserved"]
                })
            }
        } else if (governor.m[gc.ACTIVITY_NEUTRAL_COLONIES]) {
            const profitParts = values["neutral"]["profit"]/values["reserved"]["parts"];
            //console.log("POLICY_COLONIAL_OFFICE ACTIVITY_NEUTRAL_COLONIES");
            //console.log("POLICY_COLONIAL_OFFICE values[neutral]", JSON.stringify(values["neutral"]));
            if ( profitParts > gc.COLONY_PROFIT_PART_MARGIN) {
                profitableSpawnRooms.push({
                    "governor":governor,
                    "profitParts":profitParts,
                    "info":values["neutral"]
                })
            }
        }
    }
    //console.log("POLICY_COLONIAL_OFFICE checkRoom profitableRooms length",profitableSpawnRooms.length,"roomname")//,profitableSpawnRooms[0].governor.roomName);
    profitableSpawnRooms = profitableSpawnRooms.sort( (a,b) =>  {
        return b["profitParts"] - a["profitParts"];
    });
    for (let roomInfo of profitableSpawnRooms) {
        //console.log("roomInfo.governor.roomName",roomInfo.governor.roomName);
        //console.log("POLICY_COLONIAL_OFFICE about to addColoy profitParts", JSON.stringify(roomInfo.profitParts),"roomInfo.values", JSON.stringify(roomInfo.info));
        if (roomInfo.governor.addColony(
            roomName,
            roomInfo.info.profit,
            roomInfo.info.parts,
            roomInfo.info.startUpCost,
        )) {
            m.spawnRoom = roomInfo.governor.roomName;
            //console.log("POLICY_COLONIAL_OFFICE just added room",roomName,"as colony to",roomInfo.governor.roomName, "m.spawnRoom",JSON.stringify(m.spawnRoom));
            if (Game.rooms[roomName]) {
                this.build(Game.rooms[roomName], Game.rooms[m.spawnRoom], roomInfo.governor.m["reserved_colonies"]);
            } else {
                this.m.underConstruction.push(roomName)
            }
            break;
        }
    }
};

PolicyColonialOffice.prototype.build = function(colony, spawnRoom, useRoad) {
    console.log("PolicyColonialOffice build colony", colony.name,"spawnRoom", spawnRoom.name, "userroads", useRoad );
    this.buildSourceSupport(colony, spawnRoom);
    if (colony.controller.level >= 6) {
        this.buildExtractor(colony, spawnRoom)
    }
    if (useRoad) {
        this.buildRoads(colony, spawnRoom)
    }
};

PolicyColonialOffice.prototype.buildSourceSupport = function(colony, spawnRoom) {
    console.log("buildSourceSupport colony", colony.name, "spawn room", spawnRoom.name);
    const roomFlag = flag.getRoomFlag(colony.name).memory;
    const sources = colony.find(FIND_SOURCES);
    for (let source of sources) {
        policy.buildSourceContainer(source);
        roomFlag.sources[source.id]["distance"] = cache.distanceSourceController(source, spawnRoom);
    }
};

PolicyColonialOffice.prototype.buildExtractor = function(colony, spawnRoom) {
    console.log("buildExtractor colony", colony.name, "spawn room", spawnRoom.name);
    const roomFlag = flag.getRoomFlag(colony.name).memory;
    const minerals = colony.find(FIND_MINERALS);
    for (let mineral of minerals) {
        policy.buildSourceContainer(mineral);
        roomFlag.mineral["distance"] = cache.distanceSourceController(mineral, spawnRoom);
        const structs = mineral.pos.lookFor(LOOK_STRUCTURES);
        let found = false;
        for (let struct of structs) {
            if (struct.structureType === STRUCTURE_EXTRACTOR) {
                found = true;
            }
        }
        if  (!found) {
            mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
        }
    }
};

PolicyColonialOffice.prototype.buildRoads = function(colony, spawnRoom) {
    const spawns = spawnRoom.find(FIND_MY_SPAWNS);
    const sources = colony.find(FIND_SOURCES);
    for (let source of sources) {
        const pathInfo = cache.path(souce, spawns, "spawn", 1, true);
        for (let pathPos of pathInfo) {
            const pos = gf.roomPosFromPos(pathPos);
            pos.createConstructionSite(STRUCTURE_ROAD)
        }
    }
};


PolicyColonialOffice.prototype.draftReplacment = function() {
    return this
};

module.exports = PolicyColonialOffice;






















































