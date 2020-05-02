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
    if (this.creep.store.getFreeCapacity() === 0) {
        return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
    }

    const nextDelivery = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: function(s)  {
            return (s.structureType === STRUCTURE_TOWER
                || s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_SPAWN
                && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY))
        }
    });
    if (nextDelivery) {
        return state.switchToMoveTarget(
            this.creep,
            nextDelivery,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

    const controllerFlag = Game.flags[room.controller.id];
    containerPos = findContainerAt(gf.roomPosFromPos(controllerFlag.memory.containerPos))
    if (nextDelivery) {
        return state.switchToMoveTarget(
            this.creep,
            containerPos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

}

module.exports = State;