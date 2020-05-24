/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_BUILD_EXTRACTORS;
    this.id = id;
    this.home = data.home;
    this.m = data;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.finished = false;
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
Policy.prototype.enact = function () {
    const colonies = policy.getGouvernerPolicy(this.home).getColonies();
    this.m.finished = true;
    for (let colonyInfo of colonies) {
        colony = Game.rooms[colonyInfo.name];
        if (!colony) {
            this.m.finished = false;
            continue
        }
        const minerals = colony.find(FIND_MINERALS);
        minerals.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
    }
};

Policy.prototype.draftReplacment = function() {
    return this.m.finished ? false : this;
};

module.exports = Policy;







































