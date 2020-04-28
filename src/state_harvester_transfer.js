/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");

function State (creep) {
    this.type = gc.STATE_HARVESTER_TRANSFER;
    this.creep = creep
}

State.prototype.enact = function () {
    if (state.spaceForHarvest(creep)) {
        return state.switchState(this.creep, gc.STATE_HARVEST)
    }

    const target = Game.getObjectById(this.creep.memory.containerId);
    if (!target) {
        return gf.fatalError("missing target for transfer creeps memory", JSON.stringify(this.creep.memory));
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
            return state.switchToFullIdle();
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }

    state.switchState(this.creep, gc.STATE_HARVEST);
}

module.exports = State;