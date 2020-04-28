/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_UPGRADE_EMPTY;
    this.creep = creep
}

State.prototype.enact = function () {
    if (this.findAdjacentContainer()) {
        if (this.needsRepair()) {
            return state.switchState(creep, gc.STATE_UPGRADE_REPAIR)
        }
        return state.switchState(creep, gc.STATE_UPGRADE_WITHDRAW)
    }
    //state.switchState(creep, gc.STATE_UPGRADE_BUILD) todo what if container missing?
}

State.prototype.findAdjacentContainer = function () {
    if (this.creep.memory.containerId)
        return true;

    const closeBy = this.creep.room.lookAtArea(pos.y+1, pos.x-1, pos.y-1, pos.x+1, true)
    console.log("findAdjacentContainer closeby",JSON.stringify(closeBy))
    const containers = _.filter(closeBy, function(o) {
            return  o.type === LOOK_STRUCTURES
                && o.structure.structureType === STRUCTURE_CONTAINER;
        }
    )
    console.log("findAdjacentContainer containers", JSON.stringify(containers))
    if (containers.length > 0) {
        this.creep.memory.containerId = containers[0].id;
        this.container = containers[0];
        return true;
    }
    return false;
}



module.exports = State;