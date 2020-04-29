/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");
const race = require("race");

function State (creep) {
    this.type = gc.STATE_HARVESTER_FULL;
    this.container = undefined;
    this.creep = creep
}

State.prototype.enact = function () {
    if (this.findContainer()) {
        if (this.needsRepair()) {
            return state.switchState(this.creep, gc.STATE_HARVESTER_REPAIR)
        }
        return state.switchState(this.creep, gc.STATE_HARVESTER_TRANSFER)
    }
    state.switchState(this.creep, gc.STATE_HARVESTER_BUILD)
}

State.prototype.needsRepair = function () {
    if (!this.container) {
        this.container = Game.getObjectById(this.creep.memory.containerId)
    }
    return this.container.hitsMax - this.container.hits >= race.repairPower(this.creep);
}

State.prototype.findContainer = function () {
    if (this.creep.memory.containerId)
        return true;
    const pos = this.creep.pos;
    const closeBy = this.creep.room.lookAtArea(pos.y+1, pos.x-1, pos.y-1, pos.x+1, true);
    const containers = _.filter(closeBy, function(o) {
            return  o.type === LOOK_STRUCTURES
                && o.structure.structureType === STRUCTURE_CONTAINER;
        }
    )
    if (containers.length > 0) {
        this.creep.memory.containerId = containers[0].id;
        this.container = containers[0];
        return true;
    }

    return false;
}

module.exports = State;