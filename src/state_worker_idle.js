/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_WORKER_IDLE;
    this.creep = creep
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomId;
}

State.prototype.enact = function () {
    const home = Game.rooms[this.homeId];
    const target = state.findCollectContainer(this.creep.room)
    if (target && target.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        state.switchToMoveTarget(
            this.creep,
            target,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_WITHDRAW,
        );
    }

    const source = state.findTargetSource(home)
    if (source) {
        this.creep.memory.targetId = source.id;
        return state.switchToMovePos(
            this.creep,
            source.pos,
            gc.RANGE_HARVEST,
            gc.STATE_WORKER_HARVEST,
        );
    }
}

module.exports = State;