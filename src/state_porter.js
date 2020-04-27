/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const state = require("state");

function State (creep) {
    //console.log("in porter constructor", creep.name)
    this.type = gc.STATE_FULL_IDEL;
    this.creep = creep
}

State.prototype.enact = function () {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        this.creep.memory.state = gc.STATE_EMPTY_IDLE;
        this.creep.targetId = undefined;
        this.creep.say("empty");
        return state.enact(this.creep);
    }
    const target = Game.getObjectById(this.creep.memory.targetId);
    if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        return this.switchToFullIdel();
    }
    const result = this.creep.transfer(target, RESOURCE_ENERGY);
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
            return this.switchToFullIdel();
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }
    if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        return this.switchToFullIdel();
    }
}

State.prototype.switchToFullIdel = function () {
    this.creep.memory.state = gc.STATE_FULL_IDEL;
    delete this.creep.targetId;
    this.creep.say("full");
    return state.enact(this.creep);
}

module.exports = State;