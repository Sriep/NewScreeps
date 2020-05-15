/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");
const policy = require("policy");

function State (creep) {
    this.type = gc.STATE_PORTER_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
    }

    const room = Game.rooms[this.homeId];
    const governor = policy.getGouvernerPolicy(this.homeId);
    let colonies = governor.getColonies();
    const containerPos = state.findPorterSourceContainer(
        room, colonies, room.energyCapacityAvailable
    );
    if (containerPos) {
        this.creep.memory.targetId = state.findContainerAt(containerPos);
        if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            console.log(".getFreeCapacity(RESOURCE_ENERGY)", this.creep.store.getFreeCapacity(RESOURCE_ENERGY) );
            gf.fatalError("STATE_PORTER_IDLE free capacity should be 0 for withdrawal")
        }
        return state.switchToMovePos(
            this.creep,
            containerPos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_WITHDRAW,
        );
    }

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
/*
    const target = state.findCollectContainer(this.creep.room);
    if (target) {
        this.creep.memory.targetId = target.id;
        if (this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            console.log(".getFreeCapacity(RESOURCE_ENERGY)", this.creep.store.getFreeCapacity(RESOURCE_ENERGY) );
            gf.fatalError("STATE_PORTER_IDLE free capacity should be 0 for withdrawal")
        }
        return state.switchToMovePos(
            this.creep,
            target.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_WITHDRAW,
        );
    }
*/
    const policyId = this.creep.policyId;
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
};

module.exports = State;