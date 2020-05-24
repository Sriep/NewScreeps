/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
//const gf = require("gf");
const state = require("state");

function StateWorkerFullIdle (creep) {
    this.type = gc.STATE_WORKER_FULL_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}

StateWorkerFullIdle.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_WORKER_FULL_IDLE")
    const home = Game.rooms[this.homeId];
    if (home.controller.ticksToDowngrade
        < gc.EMERGENCY_DOWNGRADING_THRESHOLD) {
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
    if (nextSourceContainer) {
        this.creep.memory.targetId = nextSourceContainer.id;
        return state.switchToMovePos(
            this.creep,
            nextSourceContainer.pos,
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
};

module.exports = StateWorkerFullIdle;