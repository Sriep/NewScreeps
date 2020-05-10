/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
//const gf = require("gf");
const state = require("state");

function State (creep) {
    if (0  !== creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        //console.log(creep.name,"In STATE_WORKER_FULL_IDLE with empty creep");
    }
    this.type = gc.STATE_WORKER_FULL_IDLE;
    this.creep = creep
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    console.log(this.creep.name, "in STATE_WORKER_FULL_IDLE")
    const home = Game.rooms[this.homeId];
    //console.log("homeId", this.homeId, "downgrade", home.controller.ticksToDowngrade)
    if (home.controller.ticksToDowngrade
        < gc.EMERGENCY_DOWNGRADING_THRESHOLD) {
        //console.log("swith to emergency upgrade")
        this.creep.memory.targetId = home.controller.id;
        return state.switchToMovePos(
            this.creep,
            home.controller.pos,
            gc.RANGE_UPGRADE,
            gc.STATE_WORKER_UPGRADE
        );
    }

    if (home.controller.level < 2) {
        this.creep.memory.targetId = home.controller.id;
        return state.switchToMovePos(
            this.creep,
            home.controller.pos,
            gc.RANGE_UPGRADE,
            gc.STATE_WORKER_UPGRADE
        );
    }

    const nextSourceContainer = state.findNextSourceContainer(this.creep);
    console.log("STATE_WORKER_FULL_IDLE nextSourceContainer", JSON.stringify(nextSourceContainer));

    if (nextSourceContainer) {
        console.log("STATE_WORKER_FULL_IDLE nextSourceContainer getFreeCapacity" , nextSourceContainer.store.getFreeCapacity(RESOURCE_ENERGY))
        this.creep.memory.targetId = nextSourceContainer.id;
        return state.switchToMovePos(
            this.creep,
            nextSourceContainer.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_TRANSFER
        );
    }
    console.log("STATE_WORKER_FULL_IDLE skipped filling source containers");
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
        this.creep.memory.targetId = damagedStructure.id;
        return state.switchToMovePos(
            this.creep,
            damagedStructure.pos,
            gc.RANGE_REPAIR,
            gc.STATE_WORKER_REPAIR
        );
    }

    let nextConstructionSite = this.creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    if (nextConstructionSite != null) {
        this.creep.memory.targetId = nextConstructionSite.id;
        return state.switchToMovePos(
            this.creep,
            nextConstructionSite.pos,
            gc.RANGE_BUILD,
            gc.STATE_WORKER_BUILD
        );
    }
    this.creep.memory.targetId = home.controller.id;
    return state.switchToMovePos(
        this.creep,
        home.controller.pos,
        gc.RANGE_UPGRADE,
        gc.STATE_WORKER_UPGRADE
    );
}

module.exports = State;