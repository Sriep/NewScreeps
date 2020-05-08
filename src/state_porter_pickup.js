/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const state = require("state");

function State (creep) {
    //console.log("in porter pickup constructor", creep.name)
    this.type = gc.STATE_PORTER_PICKUP;
    this.creep = creep
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomName;
}


State.prototype.enact = function () {
    const home = Game.rooms[this.homeId];
    const drop = home.findClosestByRange(FIND_STRUCTURES, {
        filter: { structureType: FIND_DROPPED_RESOURCES }
    });

    if (!drop) {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY> 0)) {
            return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
        } else {
            return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
        }
    }

    const result = this.creep.pickup(drop);
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
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        return state.switchTo(creep, gc.STATE_PORTER_IDLE);
    }
    state.switchTo(creep, gc.STATE_PORTER_FULL_IDLE);
}

module.exports = State;