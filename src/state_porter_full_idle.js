/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_PORTER_FULL_IDLE;
    this.creep = creep
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomId;
}

State.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_PORTER_FULL_IDLE",
    //    "store", JSON.stringify(this.creep.store), "free", this.creep.store.getFreeCapacity(RESOURCE_ENERGY) );
    //console.log(this.creep.name,"this.creep.store.getUsedCapacity()", this.creep.store.getUsedCapacity(RESOURCE_ENERGY))
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        //console.log("in this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0")
        return state.switchTo(this.creep, gc.STATE_PORTER_IDLE);
    }

    const nextDelivery = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: function(s)  {
            return (s.structureType === STRUCTURE_TOWER
                || s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_SPAWN
                //&& s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY))
                && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
        }
    });
    //console.log("next delivery store", JSON.stringify(nextDelivery.store));
    //console.log("next delivery getFreeCapacity", nextDelivery.store.getFreeCapacity(RESOURCE_ENERGY));
    //console.log("nextDelivery", nextDelivery, "pos",JSON.stringify(nextDelivery.pos))
    if (nextDelivery && nextDelivery.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        //console.log("about to delive to targt store", JSON.stringify(nextDelivery.store));
        //console.log("nextSourceContainer" , nextSourceContainer.store.getFreeCapacity(RESOURCE_ENERGY))
        this.creep.memory.targetId = nextDelivery.id;
        return state.switchToMovePos(
            this.creep,
            nextDelivery.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

    const controller = Game.rooms[this.homeId].controller;
    const controllerFlag = Game.flags[controller.id];
    //console.log("contoller flag", JSON.stringify(controllerFlag))
    const container = state.findContainerAt(gf.roomPosFromPos(controllerFlag.memory.containerPos))
    if (container) {
        this.creep.memory.targetId = container.id;
        return state.switchToMovePos(
            this.creep,
            container.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

}

module.exports = State;