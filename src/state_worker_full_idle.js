/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");

function State (creep) {
    if (0  !== creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        console.log(creep.name,"In STATE_WORKER_FULL_IDLE with empty creep");
    }
    this.type = gc.STATE_WORKER_FULL_IDLE;
    this.creep = creep
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomId;
}

State.prototype.enact = function () {
    const home = Game.rooms[this.homeId];
    console.log("homeId", this.homeId)
    if (home.controller.ticksToDowngrade
        < gc.EMERGENCY_DOWNGRADING_THRESHOLD) {
        state.switchToMoveTarget(
            this.creep,
            home.controller,
            gc.RANGE_UPGRADE,
            gc.STATE_WORKER_UPGRADE
        );
    }

    if (home.controller.level <= 2) {
        state.switchToMoveTarget(
            this.creep,
            home.controller,
            gc.RANGE_UPGRADE,
            gc.STATE_WORKER_UPGRADE
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
        return state.switchToMoveTarget(
            this.creep,
            nextSourceContainer,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_TRANSFER
        );
    }

    const damagedStructure = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: function(s)  {
            return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD;
        }
    });
    if (damagedStructure != null) {
        return state.switchToMoveTarget(
            this.creep,
            damagedStructure,
            gc.RANGE_REPAIR,
            gc.STATE_WORKER_REPAIR
        );
    }

    let nextConstructionSite = this.creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    if (nextConstructionSite != null) {
        return state.switchToMoveTarget(
            this.creep,
            nextConstructionSite,
            gc.RANGE_BUILD,
            gc.STATE_WORKER_BUILD
        );
    }

    state.switchToMoveTarget(
        this.creep,
        home.controller,
        gc.RANGE_UPGRADE,
        gc.STATE_WORKER_UPGRADE
    );
}

module.exports = State;