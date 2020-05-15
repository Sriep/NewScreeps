/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_PORTER_FULL_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    if (this.creep.room.name !== this.homeId) {
        return state.switchMoveToRoom(
            this.creep,
            this.homeId,
            gc.STATE_PORTER_FULL_IDLE,
        );
    }

    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
         return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
    }

    const nextDelivery = state.findNextSourceContainer(this.creep);
    if (nextDelivery) {
         this.creep.memory.targetId = nextDelivery.id;
         return state.switchToMovePos(
            this.creep,
            nextDelivery.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

    const container = state.findUpgradeContainerToFill(Game.rooms[this.homeId]);
    if (container) {
        this.creep.memory.targetId = container.id;
        return state.switchToMovePos(
            this.creep,
            container.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

};

module.exports = State;