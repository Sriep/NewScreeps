/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");

function State (creep) {
    //console.log("in full idle constructor", creep.name)
    if (!creep)
        console.log("Creat creep state with no creep object")
    if (creep.memory.state !== gc.STATE_EMPTY_IDLE)
        console.log("In empty idele state with creep wrong state: " + JSON.stringify(creep))
    //if (0  !== creep.store.getFreeCapacity(RESOURCE_ENERGY))
    //    console.log("In full idle state with non empty creep: " + JSON.stringify(creep));
    this.type = gc.STATE_FULL_IDEL;
    this.creep = creep
}

State.prototype.enact = function () {
    let nextTarget = this.creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    if (nextTarget != null) {
        this.creep.memory.targetId = nextTarget.id;
        this.creep.memory.state = gc.STATE_MOVE_PATH;
        this.creep.memory.moveRange = gc.RANGE_BUILD;
        this.creep.memory.next_state = gc.STATE_BUILD;
        this.creep.say("find build");
        return state.enact(this.creep);
    }
    nextTarget = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(structure)  {
                return ((structure.structureType === STRUCTURE_TOWER
                            && structure.store[RESOURCE_ENERGY]
                            < structure.store.getCapacity(RESOURCE_ENERGY)
                            * gc.TOWER_REFILL_THRESHOLD)
                    || structure.structureType === STRUCTURE_EXTENSION
                    || structure.structureType === STRUCTURE_SPAWN )
                    && structure.store[RESOURCE_ENERGY]
                        < structure.store.getCapacity(RESOURCE_ENERGY);
            }
        });
    if (nextTarget != null) {
        this.creep.memory.targetId = nextTarget.id;
        this.creep.memory.state = gc.STATE_MOVE_PATH;
        this.creep.memory.moveRange = gc.RANGE_TRANSFER;
        this.creep.memory.next_state = gc.STATE_PORTER;
        this.creep.say("find storage");
        return state.enact(this.creep);
    }
    this.creep.memory.targetId = this.creep.room.controller.id;
    this.creep.memory.state = gc.STATE_MOVE_PATH;
    this.creep.memory.moveRange = gc.RANGE_UPGRADE;
    this.creep.memory.next_state = gc.STATE_UPGRADE;
    this.creep.say("go upgrade");
    return state.enact(this.creep);
}

module.exports = State;