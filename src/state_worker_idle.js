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
}

State.prototype.enact = function () {
    const source = state.findTargetSource(this.creep.room)
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