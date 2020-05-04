/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
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
    //console.log(this.creep.name, "in STATE_WORKER_FULL_IDLE")
    const home = Game.rooms[this.homeId];
    //console.log("homeId", this.homeId, "downgrade", home.controller.ticksToDowngrade)
    if (home.controller.ticksToDowngrade
        < gc.EMERGENCY_DOWNGRADING_THRESHOLD) {
        //console.log("swith to emergency upgrade")
        return state.switchToMoveTarget(
            this.creep,
            home.controller,
            gc.RANGE_UPGRADE,
            gc.STATE_WORKER_UPGRADE
        );
    }

    if (home.controller.level < 2) {
        return state.switchToMoveTarget(
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
    //console.log("nextSourceContainer pos", nextSourceContainer.pos)
    //onsole.log("nextSourceContainer", nextSourceContainer, JSON.stringify(nextSourceContainer));
    //console.log("nextSourceContainer", nextSourceContainer.store.getFreeCapacity(RESOURCE_ENERGY),
     //   "store",JSON.stringify(nextSourceContainer.store));
    if (nextSourceContainer && nextSourceContainer.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        //console.log("nextSourceContainer" , nextSourceContainer.store.getFreeCapacity(RESOURCE_ENERGY))
        return state.switchToMoveTarget(
            this.creep,
            nextSourceContainer,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_TRANSFER
        );
    }
/*
    if (nextSourceContainer.store[RESOURCE_ENERGY]
        < nextSourceContainer.store.getCapacity(RESOURCE_ENERGY)) {
        console.log("nextSourceContainer.store", JSON.stringify(nextSourceContainer.store))
        console.log("nextSourceContainer.storegetFreeCapacity", JSON.stringify(nextSourceContainer.store.getFreeCapacity(RESOURCE_ENERGY)))
        gf.fatalError("STATE_WORKER_FULL_IDLE should go to store container");
    }
*/
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

    return state.switchToMoveTarget(
        this.creep,
        home.controller,
        gc.RANGE_UPGRADE,
        gc.STATE_WORKER_UPGRADE
    );
}

module.exports = State;