/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");
const race = require("race");

function State (creep) {
    this.creep = creep
    this.state = gc.STATE_HARVESTER_IDLE
}

State.prototype.enact = function () {
    const policyId = this.creep.memory.policyId;
    const harvesters = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && race.getRace(c) === gc.RACE_HARVESTER
            && (c.memory.state === STATE_HARVESTER_BUILD
                || c.memory.state === STATE_HARVESTER_REPAIR
                || c.memory.state === STATE_HARVESTER_FULL
                || c.memory.state === STATE_HARVESTER_TRANSFER
                || c.memory.state === STATE_HARVEST)
    });
    if (harvesters >= gc.RPC_HARVESTERS[creep.room.controller.level]) {
        this.goUpgrade()
    }
    const source = state.findTargetSource();
    if (!source)
        this.goUpgrade();
    if (source.energy === 0 && this.creep.lifetime < ticksToRegeneration)
        this.goUpgrade()
    creep.say("go harvest")
    console.log("Say table", JSON.stringify(stare.creepSay))
    // todo check creep lifetime, check lives long enough to reach target.
    return state.switchToMoveTarget(
        this.creep,
        source.id,
        gc.RANGE_HARVEST,
        gc.STATE_HARVEST
    );
}

State.prototype.goUpgrade = function () {
    const controllerFlag = Games.flags[creep.room.contoller.id];
    console.log("contoler flag", JSON.stringify(controllerFlag));
    const container = state.findContainerAt(ccPos);
    if (container) {
        this.creep.memory.containerId = container.id;
    }
    creep.say("go upgrade")
    return state.switchToMovePos(
        this.creep,
        ccPos,
        gc.RANGE_TRANSFER,
        gc.STATE_UPGRADE_EMPTY
    );
}

module.exports = State;































