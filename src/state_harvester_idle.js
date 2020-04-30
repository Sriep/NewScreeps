/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");
const race = require("race");
const economy = require("economy");

function State (creep) {
    this.creep = creep
    this.state = gc.STATE_HARVESTER_IDLE
}

State.prototype.enact = function () {
    const policyId = this.creep.memory.policyId;
    const harvesters = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && race.getRace(c) === gc.RACE_HARVESTER
            && (c.memory.state === gc.STATE_HARVESTER_BUILD
                || c.memory.state === gc.STATE_HARVESTER_REPAIR
                || c.memory.state === gc.STATE_HARVESTER_FULL
                || c.memory.state === gc.STATE_HARVESTER_TRANSFER
                || c.memory.state === gc.STATE_HARVEST)
    });
    if (harvesters >= economy.estimateHomeHarvesters(this.creep.room)) {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
            return this.goUpgrade();
        }
    }
    const source = state.findTargetSource(this.creep.room);
    if (!source) {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
            return this.goUpgrade();
        }
        return;
    }
    //console.log("source STATE_HARVESTER_IDLE", source)
    //console.log("source energy STATE_HARVESTER_IDLE", source.energy)
    if (source.energy === 0 && this.creep.lifetime < source.ticksToRegeneration) {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
            return this.goUpgrade();
        }
    }
    // todo check creep lifetime, check lives long enough to reach target.
    state.switchToMoveTarget(
        this.creep,
        source,
        gc.RANGE_HARVEST,
        gc.STATE_HARVEST
    );
}

State.prototype.goUpgrade = function () {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        return;
    }

    this.creep.targetId = this.creep.room.controller.id;
    const controllerFlag = Game.flags[this.creep.room.controller.id];
    let ccPos = gf.roomPosFromPos(controllerFlag.memory.container);

    this.creep.say("go upgrade")
    return state.switchToMovePos(
        this.creep,
        ccPos,
        gc.RANGE_TRANSFER,
        gc.STATE_UPGRADE
    );
}

module.exports = State;






























