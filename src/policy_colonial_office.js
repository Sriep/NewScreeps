/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const flag = require("flag");
const cache = require("cache");
const FlagRoom = require("flag_room");

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
    this.m.underConstruction = [];
    Memory.policyRates[this.id] = gc.COLONIAL_OFFICE_RATE;
    return true;
};

PolicyColonialOffice.prototype.enact = function () {
    if ((Game.time + this.id) % 100 !== 0) {
        return;
    }
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
            //console.log("POLICY_COLONIAL_OFFICE underContruction", this.m.underConstruction[i]);
            //this.build(this.m.underConstruction[i], roomFlag.memory.spawnRoom, false)
            this.build(this.m.underConstruction[i], "W7N7", false); // todo hack remove line
            this.m.underConstruction.splice(i,1);
        }
    }
};
//FlagRoom.prototype.value = function (spawnRoom, roads, reserve, srEnergyCap)
PolicyColonialOffice.prototype.checkRoom = function(roomName) {
    //console.log("checkRoom", roomName);
    const fRoom = new FlagRoom(roomName);
    let candidates = [];
    for (let spawnRoom in fRoom.m.paths) {
        const valueTF = fRoom.value(spawnRoom,true, false);
        const governor = policy.getGouvernerPolicy(spawnRoom);
        if (valueTF.profitParts > governor.minColonyProfitParts() ||
            valueTF.netParts < governor.minFreeColonyParts()) {
            candidates.push({ "name": spawnRoom, "valueTF": valueTF, "governor": governor })
        }
    }
    candidates = candidates.sort( (a,b) =>  {
        return b.valueTF["profitParts"] - a.valueTF["profitParts"];
    });
    //console.log("checkRoom candidates", candidates);
    for (let candidate of candidates) {
        const newColony = candidate.governor.requestAddColony(fRoom);
        //console.log("checkRoom requestAddColony",newColony, newColony.added);
        console.log("checkRoom requestAddColony",JSON.stringify(newColony));
        if (newColony.added) {
            fRoom.m.spawnRoom = candidate.governor.roomName;
            if (Game.rooms[roomName]) {
                this.build(
                    Game.rooms[roomName],
                    Game.rooms[fRoom.m.spawnRoom],
                    newColony.useRoads,
                );
            } else {
                this.m.underConstruction.push(roomName)
            }
            break;
        }
    }

};

PolicyColonialOffice.prototype.build = function(colony, spawnRoom, useRoad) {
    console.log("PolicyColonialOffice build colony", colony.name,"spawnRoom", spawnRoom.name, "userroads", useRoad );
    if (!colony || !spawnRoom | !spawnRoom.controller) {
        return;
    }

    this.buildSourceSupport(colony, spawnRoom);

    if (spawnRoom.controller.level >= 6) {
        this.buildExtractor(colony, spawnRoom)
    }
    if (useRoad) {
        this.buildRoads(colony, spawnRoom)
    }
};

PolicyColonialOffice.prototype.buildSourceSupport = function(colony, spawnRoom) {
    console.log("buildSourceSupport colony", colony.name, "spawn room", spawnRoom.name);
    if  (!flag.getRoomFlag(colony.name)) {
        return
    }
    const roomFlag = flag.getRoomFlag(colony.name).memory;
    const sources = colony.find(FIND_SOURCES);
    for (let source of sources) {
        policy.buildSourceContainer(source);
        roomFlag.sources[source.id]["distance"] = cache.distanceSourceController(source, spawnRoom);
    }
};

PolicyColonialOffice.prototype.buildExtractor = function(colony, spawnRoom) {
    console.log("buildExtractor colony", colony.name, "spawn room", spawnRoom.name);
    //const roomFlag = flag.getRoomFlag(colony.name).memory;
    const minerals = colony.find(FIND_MINERALS);
    for (let mineral of minerals) {
        policy.buildSourceContainer(mineral);
        //roomFlag.mineral["distance"] = cache.distanceSourceController(mineral, spawnRoom);
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
        const pathInfo = cache.path(source, spawns, colony.name + "PCObuildRoads", 1, true);
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






















































