/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
// const gf = require("gf");
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_WORKER_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
    this.m = creep.memory;
    // console.log("STATE_WORKER_IDLE this", JSON.stringify(this));
}

State.prototype.enact = function () {
    //console.log(this.creep.name,"STATE_WORKER_IDLE")
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        state.switchTo(this.creep, gc.STATE_WORKER_FULL_IDLE);
    }

    if (this.workToDo(this.homeId)) {
        return this.enactOld();
    }
    const newRoom = this.findNewRoom(this.homeId);
    if (!!newRoom) {
        return state.switchMoveToRoom(
            this.creep,
            colony,
            gc.STATE_WORKER_IDLE,
        );
    }
    return this.enactOld();
};

State.prototype.findNewRoom = function(homeName) {
    const governor = policy.getGouvernerPolicy(homeName);
    let colonies = governor.m.colonies;
    if (colonies.length === 0) {
        return false;
    }
    colonies = colonies.sort( (c1, c2)  => {
        return Game.map.getRoomLinearDistance(c1, this.creep.room.name)
            - Game.map.getRoomLinearDistance(c2, this.creep.room.name)
    });
    for (let colony of colonies) {
        if (this.workToDo(colony)) {
            return colony;
        }
    }
    return false;
};

State.prototype.workToDo = function(colonyName) {
    const colony = Game.rooms[colonyName];
    let nextConstructionSite = colony.find(FIND_MY_CONSTRUCTION_SITES);
    if (nextConstructionSite) {
        return true;
    }
    return !!colony.find(FIND_STRUCTURES, {
        filter: function(s)  {
            return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD;
        }
    });
};

State.prototype.enactOld = function () {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return state.switchTo(this.creep, gc.STATE_WORKER_FULL_IDLE);
    }

    const drop = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: { structureType: FIND_DROPPED_RESOURCES }
    });
    if (drop) {
        return state.switchToMovePos(
            this.creep,
            drop.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_PICKUP,
        );
    }

    const container = state.findCollectContainer(this.creep.room);
    if (container) {
        this.creep.memory.targetId = container.id;
        return state.switchToMovePos(
            this.creep,
            container.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_WITHDRAW,
        );
    }

    const policyId = this.policyId;
    let creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && state.isHarvestingHarvester(c)
    });
    if (creeps.length > 0) {
        creeps = creeps.sort( function (a,b)  {
            return b.store.getUsedCapacity(RESOURCE_ENERGY)
                - a.store.getUsedCapacity(RESOURCE_ENERGY);
        } );
        this.creep.memory.targetId = creeps[0].name;
        return state.switchToMovePos(
            this.creep,
            creeps[0].pos,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_RECEIVE
        )
    }

    const source = state.workerFindTargetSource(Game.rooms[this.homeId], this.creep);
    if (source) {
        this.creep.memory.targetId = source.id;
        return state.switchToMovePos(
            this.creep,
            source.pos,
            gc.RANGE_HARVEST,
            gc.STATE_WORKER_HARVEST,
        );
    }
};

module.exports = State;

























