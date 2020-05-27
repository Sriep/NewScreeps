/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");

// constructor
function PolicyBuildExtractors  (id, data) {
    this.type = gc.POLICY_BUILD_EXTRACTORS;
    this.id = id;
    this.home = data.home;
    this.m = data.m;
    this.parentId = data.parentId;
}

// runs first time policy is created only
PolicyBuildExtractors.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.finished = false;
    //console.log("PolicyBuildExtractors initilise", JSON.stringify(this));
    //console.log("Memory.policies[this.parentId]", JSON.stringify(Memory.policies[this.parentId]))
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
PolicyBuildExtractors.prototype.enact = function () {
    console.log("POLICY_BUILD_EXTRACTORS this", JSON.stringify(this))
    const colonies = policy.getGouvernerPolicy(this.home).getColonies();
    this.m.finished = true;
    for (let colonyInfo of colonies) {
        const colony = Game.rooms[colonyInfo.name];
        if (!colony) {
            this.m.finished = false;
            continue
        }
        const minerals = colony.find(FIND_MINERALS);
        const built = colony.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTRACTOR }
        });
        if (built.length >= minerals.length) {
            continue;
        }

        const beingBuilt  = colony.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTRACTOR }
        });
        if (beingBuilt.length + built.length < minerals.length) {
            for (let mineral of minerals) {
                mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
            }
        }
    }
};

PolicyBuildExtractors.prototype.draftReplacment = function() {
    return this;
    //return this.m.finished ? false : this;
};

module.exports = PolicyBuildExtractors;







































