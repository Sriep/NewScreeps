/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

//const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_BUILD_LINK;
    this.id = id;
    this.home = data.home;
    this.m = data.m;
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
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedLinks = CONTROLLER_STRUCTURES[STRUCTURE_LINK[rcl]];
    const storage = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_LINK }
    });
    if (storage.length >= allowedLinks) {
        this.m.finished = true;
        return;
    }
    const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_LINK }
    });
    if (storage.length + beingBuilt.length >= allowedLinks) {
        return;
    }
    const wantedLinks = allowedLinks - storage.length - beingBuilt.length;
    policy.buildStructuresLooseSpiral(room, STRUCTURE_STORAGE, wantedLinks, 0);
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    return this.m.finished ? false : this;
};

module.exports = Policy;






























