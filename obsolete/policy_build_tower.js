/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

//const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

// constructor
function PolicyBuildTower  (id, data) {
    this.type = gc.POLICY_BUILD_TOWER;
    this.id = id;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

PolicyBuildTower.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.finished = false;
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

PolicyBuildTower.prototype.enact = function () {
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedTowers = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl];
    //console.log("POLICY_BUILD_TOWER rcl", rcl,"STRUCTURE_TOWER[rcl]", STRUCTURE_TOWER[rcl],
    //    "CONTROLLER_STRUCTURES[STRUCTURE_TOWER[rcl]]",CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl])
    const towers = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
    });
    if (towers.length >= allowedTowers) {
        this.m.finished = true;
        return;
    }
    const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_TOWER }
    });
    if (towers.length + beingBuilt.length >= allowedTowers) {
         return;
    }
    const wantedTowers = allowedTowers - towers.length - beingBuilt.length;
    //console.log("POLICY_BUILD_TOWER wantedTowers",wantedTowers,"allowedTowers",allowedTowers,
    //    "towers.length",towers.length,"beingBuilt.length",beingBuilt.length)
    policy.buildStructuresLooseSpiral(room, STRUCTURE_TOWER, wantedTowers, 0);
};

PolicyBuildTower.prototype.draftReplacment = function() {
    return this.m.finished ? false : this;
};

module.exports = PolicyBuildTower;






























