/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_PORTER_FULL_IDLE;
    this.creep = creep
}

State.prototype.enact = function () {
    const nextDelivery = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: function(s)  {
            return (s.structureType === STRUCTURE_TOWER
                || s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_SPAWN
                || s.structureType === STRUCTURE_CONTAINER)
                && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY);
        }
    });
    if (nextDelivery != null) {
        return state.switchToMoveTarget(
            this.creep,
            nextSourceContainer.id,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER
        );
    }
    if (this.creep.store.getFreeCapacity() > 0) {
        return state.switchState(this.creep, gc.STATE_PORTER_IDLE);
    }
}

module.exports = State;