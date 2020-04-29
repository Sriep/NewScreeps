/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_PORTER_IDLE;
    this.creep = creep
}

State.prototype.enact = function () {
    const target = state.findResourceToMove(this.creep)
    if (target) {
        state.switchToMoveTarget(
            this.creep,
            target.id,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER,
        );
    }
    const drop = creep.room.findClosestByRange(FIND_STRUCTURES, {
        filter: { structureType: FIND_DROPPED_RESOURCES }
    });
    if (drop) {
        state.switchToMovePos(
            this.creep,
            drop.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_PICKUP,
        );
    }
    // todo follow harvester
    const policyId = this.creep.policyId
    const creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && (c.memory.state === gc.STATE_HARVEST
                || c.memory.state === gc.STATE_HARVESTER_FULL
                || c.memory.state === gc.STATE_HARVESTER_TRANSFER
                || c.memory.state === gc.STATE_HARVESTER_REPAIR
                || c.memory.state === gc.STATE_HARVESTER_BUILD )
    });
}

module.exports = State;