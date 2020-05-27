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
}

// runs first time policy is created only
PolicyBuildExtractors.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.finished = false;
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
PolicyBuildExtractors.prototype.enact = function () {
    const colonies = policy.getGouvernerPolicy(this.home).getColonies();
    this.m.finished = true;
    for (let colonyInfo of colonies) {
        const colony = Game.rooms[colonyInfo.name];
        if (!colony) {
            this.m.finished = false;
            continue
        }
        const minerals = colony.find(FIND_MINERALS);
        const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_LINK }
        });
        if (beingBuilt.length < minerals.length) {
            for (let mineral in minerals) {
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







































