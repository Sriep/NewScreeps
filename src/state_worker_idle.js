/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_WORKER_IDLE;
    this.creep = creep
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomId;
}

State.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_WORKER_IDLE")
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

    const container = state.findCollectContainer(this.creep.room)
    //console.log("STATE_WORKER_IDLE container cap",  container.store.getUsedCapacity(RESOURCE_ENERGY) )
    if (container  && container.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        console.log("move to container", JSON.stringify(container.pos))
        return state.switchToMoveTarget(
            this.creep,
            container,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_WITHDRAW,
        );
    }

    const policyId = this.creep.policyId
    let creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && state.isHarvestingHarvester(c)
    });
    //console.log("isHarvestingHarvester coumt", creeps.length);
    if (creeps.length > 0) {
        cosole.log("movoing to harvester");
        creeps = creeps.sort( function (a,b)  {
            return b.store.getUsedCapacity(RESOURCE_ENERGY)
                - a.store.getUsedCapacity(RESOURCE_ENERGY);
        } );
        return state.switchToMoveTarget(
            this.creep,
            creeps[0],
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_RECEIVE
        )
    }

    //console.log("not found harvester going to source");


    const source = state.findTargetSource(Game.rooms[this.homeId])
    if (source) {
        this.creep.memory.targetId = source.id;
        return state.switchToMovePos(
            this.creep,
            source.pos,
            gc.RANGE_HARVEST,
            gc.STATE_WORKER_HARVEST,
        );
    }
}

module.exports = State;