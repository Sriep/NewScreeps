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
class PolicyColonialOffice  {
    constructor (id, data) {
        this.type = gc.POLICY_COLONIAL_OFFICE;
        this.id = id;
        this.m = data.m;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.m.underConstruction = [];
        Memory.policyRates[this.id] = gc.COLONIAL_OFFICE_RATE;
        return true;
    };

    enact() {
        if ((Game.time + this.id) % 100 !== 0) {
            return;
        }
        this.lookForNewColonies();
    };

    lookForNewColonies() {
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

    checkRoom(roomName) {
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

    build(colony, spawnRoom, useRoad) {
        console.log("PolicyColonialOffice build colony", colony.name,"spawnRoom", spawnRoom.name, "userroads", useRoad );
        if (!colony || !spawnRoom | !spawnRoom.controller) {
            return;
        }

        this.buildSourceSupport(colony, spawnRoom);

        if (spawnRoom.controller.level >= 6) {
            this.buildExtractor(colony, spawnRoom)
        }
        if (useRoad) {
            // todo
            //this.buildRoads(colony, spawnRoom)
        }
    };

    buildSourceSupport(colony, spawnRoom) {
        console.log("buildSourceSupport colony", colony.name, "spawn room", spawnRoom.name);
        if  (!flag.getRoomFlag(colony.name)) {
            return
        }
        //const roomFlag = flag.getRoomFlag(colony.name).memory;
        const sources = colony.find(FIND_SOURCES);
        for (let source of sources) {
            policy.buildSourceContainer(source);
        }
    };

    buildExtractor(colony, spawnRoom) {
        console.log("buildExtractor colony", colony.name, "spawn room", spawnRoom.name);
        const minerals = colony.find(C.FIND_MINERALS);
        for (let mineral of minerals) {
            policy.buildSourceContainer(mineral);
            const structs = mineral.pos.lookFor(C.LOOK_STRUCTURES);
            let found = false;
            for (let struct of structs) {
                if (struct.structureType === C.STRUCTURE_EXTRACTOR) {
                    found = true;
                }
            }
            if  (!found) {
                mineral.pos.createConstructionSite(C.STRUCTURE_EXTRACTOR);
            }
        }
    };

    buildRoads(colony) {
        const fColony = flag.getRoom(colony.name);
        //const spawns = spawnRoom.find(FIND_MY_SPAWNS);
        const sources = colony.find(FIND_SOURCES);
        let finished = false;
        for (let source of sources) {
            const sPath = fColony.getSPath(colony.name, source.id, fColony.PathTo.SpawnRoad, false);
            const path = cache.deserialiseRoPath(sPath, colony.room);
            const lastRoom = colony.name;
            for (let pos of path) {
                // todo need code to handle multiple rooms that might not be being mined
                if (pos.roomName !== lastRoom) {
                    if (!Game.rooms[pos.roomName]) {
                        finished = false;
                        break;
                    }
                    finished = false;
                    break;
                }
                if (!this.findRoadAt(pos)) {
                    if (Object.keys(Game.constructionSites).length > C.MAX_CONSTRUCTION_SITES/0.5) {
                        finished = C.OK === pos.createConstructionSite(C.STRUCTURE_ROAD) && finished;
                    }
                }
            }
        }
    };

    myConstructionSites = function() {
        Object.keys(Game.constructionSites).length

    };

    findRoadAt(pos) {
        const structAt = pos.lookFor(C.LOOK_STRUCTURES);
        if (structAt.length > 0 && struct[0].structureType === C.STRUCTURE_ROAD) {
            return structAt[0];
        }
        const constructionAt = pos.lookFor(C.LOOK_CONSTRUCTION_SITES);
        if (constructionAt.length > 0 && constructionAt[0].structureType === c.STRUCTURE_ROAD) {
            return constructionAt[0];
        }
        return false;
    };

    draftReplacment() {
        return this
    };
}



module.exports = PolicyColonialOffice;






















































