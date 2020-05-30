/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const FlagOwnedRoom = require("flag_owned_room");

// constructor
function PolicyBuildStructure  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_STRUCTURE;
    this.structureType = data.structureType;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

// runs first time policy is created only
PolicyBuildStructure.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.built = false;
    this.home = Memory.policies[this.parentId].roomName;
    return gc.PLANNED_BUILDS;
};

// runs once every tick
PolicyBuildStructure.prototype.enact = function () {
    //console.log("POLICY_BUILD_STRUCTURE this",JSON.stringify(this));
    const fRoom = new FlagOwnedRoom(this.home);
    this.m.built = !fRoom.buildStructure(this.structureType)
};

PolicyBuildStructure.prototype.draftReplacment = function() {
    return this.m.built ? false : this;
};

module.exports = PolicyBuildStructure;













