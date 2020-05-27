/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");

function StateWorkerBuild (creep) {
    this.type = gc.STATE_WORKER_BUILD;
    this.creep = creep
}

StateWorkerBuild.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_WORKER_BUILD")
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        return state.switchTo(this.creep, gc.STATE_WORKER_IDLE);
    }
    const target = Game.getObjectById(this.creep.memory.targetId);
    if (!target) {
        return state.switchTo(this.creep, gc.STATE_WORKER_FULL_IDLE);
    }
    const result = this.creep.build(target);
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_BUSY:                  // The creep is still being spawned.
            return gf.fatalError("ERR_BUSY");
        case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
            return gf.fatalError("ERR_NOT_ENOUGH_RESOURCES");
        case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
            return state.switchTo(this.creep, gc.STATE_WORKER_FULL_IDLE);
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return state.switchTo(this.creep, gc.STATE_WORKER_FULL_IDLE);
        case ERR_NO_BODYPART:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("ERR_NO_BODYPART");
        default:
            return gf.fatalError("no valid result");
    }
};

module.exports = StateWorkerBuild;