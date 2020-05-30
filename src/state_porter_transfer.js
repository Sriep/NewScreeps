/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");

function StatePorterTransfer (creep) {
    this.type = gc.STATE_PORTER_TRANSFER;
    this.creep = creep
}

StatePorterTransfer.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_PORTER_TRANSFER");
    if (this.creep.store.getUsedCapacity() === 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_IDLE)
    }
    const target = Game.getObjectById(this.creep.memory.targetId);
    const resource = this.findTransferResource(target.store, this.creep.store);
    if (!resource) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_FULL_IDLE);
    }

    const result = this.creep.transfer(target, resource);
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
            return gf.fatalError("transfer ERR_NOT_OWNER");
        case ERR_BUSY:                  // The creep is still being spawned.
            return gf.fatalError("transfer ERR_BUSY");
        case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
            return gf.fatalError("transfer ERR_NOT_ENOUGH_RESOURCES");
        case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
            return gf.fatalError("transfer ERR_INVALID_TARGET");
        case ERR_FULL:        // The extractor or the deposit is still cooling down.
            return state.switchToFullIdle();
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }
};

StatePorterTransfer.prototype.findTransferResource = function(target, source) {
    for (let resource in source) {
        if (target.getFreeCapacity(resource) > 0 && source[resource] > 0) {
            return resource;
        }
    }
};

module.exports = StatePorterTransfer;




















