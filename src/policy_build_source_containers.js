/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

//const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

function PolicyBuildSourceContainers  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_SOURCE_CONTAINERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

PolicyBuildSourceContainers.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

PolicyBuildSourceContainers.prototype.enact = function () {
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        policy.buildSourceContainer(source);
    }
};

PolicyBuildSourceContainers.prototype.draftReplacment = function() {
    const room = Game.rooms[this.home];
    return policy.areSourceContainersFinished(room) ? false : this;
};

module.exports = PolicyBuildSourceContainers;





































