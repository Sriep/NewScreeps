/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

    const gc = require("gc");
    const state = require("state");

    function State (creep) {
        this.type = gc.STATE_PORTER_IDLE;
        this.creep = creep
    }

    State.prototype.enact = function () {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        //console.log("in this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0")
        return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
    }

    //console.log(this.creep.name, "in STATE_PORTER_IDLE");
    const drop = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: { structureType: FIND_DROPPED_RESOURCES }
    });
    if (drop) {
        return state.switchToMovePos(
            this.creep,
            drop.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_PICKUP,
        );
    }

    const target = state.findCollectContainer(this.creep.room)
    if (target) {
        this.creep.memory.targetId = target.id;
        return state.switchToMovePos(
            this.creep,
            target.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_WITHDRAW,
        );
    }

    const policyId = this.creep.policyId
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
            gc.STATE_PORTER_RECEIVE
        )
    }
}

module.exports = State;