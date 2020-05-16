/**
 * @fileOverview screeps
 * Created by piers on 29/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_PORTER_WITHDRAW;
    this.creep = creep
}

State.prototype.enact = function () {
    if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
    }

    //console.log(this.creep.name, "in STATE_PORTER_WITHDRAW");
    let target;
    if (this.creep.memory.targetId) {
        target = Game.getObjectById(this.creep.memory.targetId);
    }
    if (!target) {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY > 0)) {
            return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
        } else {
            return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
        }
    }

    const result = this.creep.withdraw(target, RESOURCE_ENERGY);
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
            return gf.fatalError("transfer ERR_NOT_OWNER");
        case ERR_BUSY:                  // The creep is still being spawned.
            return gf.fatalError("transfer ERR_BUSY");
        case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
            return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
        case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
            return gf.fatalError("transfer ERR_INVALID_TARGET");
        case ERR_FULL:        // The extractor or the deposit is still cooling down.
            return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }
    delete this.creep.memory.next_state;
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
    } else {
        return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
    }
/* todo code to wait until full before returning. Do we need this?
    const sources = this.creep.room.find(FIND_SOURCES);
    let mySource;
    for (let source of sources) {
        if (source.pos.isNearTo(this.creep.memory.targetPos.x, this.creep.memory.targetPos.y)){
            mySource = source;
            break;
        }
    }
    if (mySource) {
        creeps = _.filter(Game.creeps, c => c.memory.targetId === mySource.id);
        if (creeps.length > 0 && creeps[0].pos.isNearTo(mySource)) {
            return;
        }
    }
*/
};

module.exports = State;

































