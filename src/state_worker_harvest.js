/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_WORKER_HARVEST;
    this.creep = creep
}

State.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_WORKER_HARVEST")
    if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        return state.switchTo(this.creep, gc.STATE_WORKER_FULL_IDLE);
    }
    const target = Game.getObjectById(this.creep.memory.targetId);
    if (target.energy > 0) {
        const result = this.creep.harvest(target);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                return gf.fatalError("ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                return gf.fatalError("ERR_BUSY");
            case ERR_NOT_FOUND:     // Extractor not found. You must build an extractor structure to harvest minerals. Learn more.
                return gf.fatalError(ERR_NOT_FOUND);
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                return gf.fatalError("ERR_NOT_ENOUGH_RESOURCES");
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                return gf.fatalError("ERR_INVALID_TARGET");
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                return gf.fatalError("ERR_NOT_IN_RANGE");
            case ERR_TIRED:        // The extractor or the deposit is still cooling down.
                return ERR_TIRED;
            case ERR_NO_BODYPART:        // There are no WORK body parts in this creep’s body.
                return gf.fatalError("ERR_NO_BODYPART");
            default:
                throw("harvest unrecognised return value");
        }
    }
    if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        return state.switchTo(this.creep, gc.STATE_FULL_IDLE);
    }
}

module.exports = State;