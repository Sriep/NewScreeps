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
        //console.log("In empty idele state with creep wrong state: " + JSON.stringify(creep))
    //if (0  !== creep.store.getFreeCapacity(RESOURCE_ENERGY))
    //    console.log("In full idle state with non empty creep: " + JSON.stringify(creep));
    this.type = gc.STATE_FULL_IDEL;
    this.creep = creep
}

State.prototype.enact = function () {
    if (this.creep.room.controller.ticksToDowngrade
        < gc.EMERGENCY_DOWNGRADING_THRESHOLD) {
        state.switchToMovePath(
            this.creep,
            this.creep.room.controller.id,
            gc.RANGE_UPGRADE,
            gc.STATE_UPGRADE
        );
    }

    const nextSourceContainer = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
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
    if (nextSourceContainer != null) {
        return state.switchToMovePath(
            this.creep,
            nextSourceContainer.id,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER
        );
    }

    const damagedStructure = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: function(s)  {
            return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD;
        }
    });
    if (damagedStructure != null) {
        return state.switchToMovePath(
            this.creep,
            damagedStructure.id,
            gc.RANGE_REPAIR,
            gc.STATE_REPAIR
        );
    }

    let nextConstructionSite = this.creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    if (nextConstructionSite != null) {
        return state.switchToMovePath(
            this.creep,
            nextConstructionSite.id,
            gc.RANGE_BUILD,
            gc.STATE_BUILD
        );
    }

    state.switchToMovePath(
        this.creep,
        this.creep.room.controller.id,
        gc.RANGE_UPGRADE,
        gc.STATE_UPGRADE
    );
}

module.exports = State;