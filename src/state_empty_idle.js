/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");

function State (creep) {
    //console.log("in creep constructor", creep.name)
    if (!creep)
        throw("Creat creep state with no creep object")
    if (creep.memory.state !== gc.STATE_EMPTY_IDLE)
        throw("In empty idele state with creep wrong state: " + JSON.stringify(creep))
    if (creep.store.getCapacity(RESOURCE_ENERGY)
        !== creep.store.getFreeCapacity(RESOURCE_ENERGY))
        throw("In empty idle state with non empty creep: " + JSON.stringify(creep));
    this.type = gc.STATE_EMPTY_IDLE;
    this.creep = creep
}

State.prototype.enact = function () {
    const source = state.findTargetSource(this.creep.room)
    if (source) {
        this.creep.memory.targetId = source.id;
        this.creep.memory.state = gc.STATE_MOVE_PATH;
        this.creep.memory.moveRange = gc.RANGE_HARVEST;
        this.creep.memory.next_state = gc.STATE_HARVEST;
        this.creep.say(gc.SAY_IDLE_MOVE)
        return state.enact(this.creep);
    }
}

module.exports = State;