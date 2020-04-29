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
            && (c.memory.state === gc.STATE_HARVESTER_BUILD
                || c.memory.state === gc.STATE_HARVESTER_REPAIR
                || c.memory.state === gc.STATE_HARVESTER_FULL
                || c.memory.state === gc.STATE_HARVESTER_TRANSFER
                || c.memory.state === gc.STATE_HARVEST)
    });
    if (harvesters >= gc.RPC_HARVESTERS[this.creep.room.controller.level]) {
        this.goUpgrade()
    }
    const source = state.findTargetSource(this.creep.room);
    if (!source)
        this.goUpgrade();
    if (source.energy === 0 && this.creep.lifetime < ticksToRegeneration)
        this.goUpgrade()
    this.creep.say("go harvest")
    //console.log("Say table", JSON.stringify(state.creepSay))
    //console.log("Say table", this.creep.say(state.CreepSay[gc.STATE_HARVEST]))
    // todo check creep lifetime, check lives long enough to reach target.
    return state.switchToMoveTarget(
        this.creep,
        source.id,
        gc.RANGE_HARVEST,
        gc.STATE_HARVEST
    );
}

State.prototype.goUpgrade = function () {
    const controllerFlag = Game.flags[this.creep.room.contoller.id];
    console.log("contoler flag", JSON.stringify(controllerFlag));
    const container = state.findContainerAt(ccPos);
    if (container) {
        this.creep.memory.containerId = container.id;
    }
    this.creep.say("go upgrade")
    return state.switchToMovePos(
        this.creep,
        ccPos,
        gc.RANGE_TRANSFER,
        gc.STATE_UPGRADE_EMPTY
    );
}

module.exports = State;































