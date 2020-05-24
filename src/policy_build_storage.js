/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

//const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

// constructor
function PolicyBuildStorage  (id, data) {
    this.type = gc.POLICY_BUILD_STORAGE;
    this.id = id;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

// runs first time policy is created only
PolicyBuildStorage.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.finished = false;
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
PolicyBuildStorage.prototype.enact = function () {
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedStorage = CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][rcl];
    const storages = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_STORAGE }
    });
    if (storages.length >= allowedStorage) {
        this.m.finished = true;
        return;
    }
    const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_STORAGE }
    });
    if (storages.length + beingBuilt.length >= allowedStorage) {
        return;
    }
    console.log("POLICY_BUILD_STORAGE allowedStorage",allowedStorage,"storages.length",storages.length
        ,"beingBuilt.length",beingBuilt.length);
    const wantedStorage = allowedStorage - storages.length - beingBuilt.length;
    policy.buildStructuresLooseSpiral(room, STRUCTURE_STORAGE, wantedStorage, 0);
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
PolicyBuildStorage.prototype.draftReplacment = function() {
    return this.m.finished ? false : this;
};

module.exports = PolicyBuildStorage;






























