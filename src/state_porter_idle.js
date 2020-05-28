/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");
const policy = require("policy");

function StatePorterIdle (creep) {
    this.type = gc.STATE_PORTER_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}


StatePorterIdle.prototype.enact = function () {
    console.log(this.creep.name,"STATE_PORTER_IDLE");
    delete this.creep.memory.targetId;
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return state.switchTo(this.creep, gc.STATE_PORTER_FULL_IDLE);
    }

    const room = Game.rooms[this.homeId];
    const governor = policy.getGouvernerPolicy(this.homeId);
    let colonies = governor.getColonies();
    //{"pos" : cPos, "distance" : distance, "sourceId" : sourceId}
    const info = state.findPorterSourceContainer(
        room, colonies, room.energyCapacityAvailable
    );
    console.log(this.creep.name, "STATE_PORTER_IDLE pos", JSON.stringify(info));
    if (info.pos) {
        this.creep.memory.targetId = info.sourceId;
        console.log(this.creep.name, "STATE_PORTER_IDLE targetId",this.creep.memory.targetId);
        return state.switchToMovePos(
            this.creep,
            info.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_WITHDRAW,
        );
    }

    // todo maybe this should go first?
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

    undefined.break;
};

module.exports = StatePorterIdle;