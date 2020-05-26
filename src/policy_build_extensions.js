/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
//const gf = require("gf");
//const construction = require("construction");
const policy = require("policy");

// constructor
function PolicyBuildExtensions  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_EXTENSIONS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

// runs first time policy is created only
PolicyBuildExtensions.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.finished = false;
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
PolicyBuildExtensions.prototype.enact = function () {
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl];
    const extensions = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    if (extensions.length >= allowedExtensions) {
        this.m.finished = true;
        return;
    }
    const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    if (extensions.length + beingBuilt.length >= allowedExtensions) {
        return;
    }
    const wantedExtensions = allowedExtensions - extensions.length - beingBuilt.length;
    console.log("POLICY_BUILD_EXTENSIONS still need to set up",wantedExtensions ,"construction sites");
    policy.buildStructuresLooseSpiral(room, STRUCTURE_EXTENSION, wantedExtensions, 3);
};

PolicyBuildExtensions.prototype.draftReplacment = function() {
    return this.m.finished ? false : this;
};

module.exports = PolicyBuildExtensions;