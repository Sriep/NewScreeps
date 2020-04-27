/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const state = require("state");

function State (creep) {
    console.log("in state upgrade constuctor")
    this.type = gc.STATE_UPGRADE;
    this.creep = creep
}

State.prototype.enact = function () {
    console.log("in state upgrade enact")
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        this.creep.memory.state = gc.STATE_EMPTY_IDLE;
        this.creep.targetId = undefined;
        this.creep.say("empty");
        return state.enact(this.creep);
    }
    const target = Game.getObjectById(this.creep.memory.targetId);
    const result = this.creep.upgradeController(target);
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
            return gf.fatalError("ERR_INVALID_TARGET");
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("ERR_NOT_IN_RANGE");
        case ERR_NO_BODYPART:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("ERR_NO_BODYPART");
        default:
            return gf.fatalError("no valid result");
    }
}

module.exports = State;