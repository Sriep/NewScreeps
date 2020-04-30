/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");
const budget = require("budget");

function State (creep) {
    this.creep = creep
    this.state = gc.STATE_HARVESTER_IDLE
}

State.prototype.enact = function () {
    const wsHarvesting = state.wsHarvesting(this.creep.memory.policyId)
    if (wsHarvesting >= budget.harvesterWsRoom(this.creep.room, this.creep.room)) {
            return this.goUpgrade();
    }
    const post = state.findFreeHarvesterPost(this.creep.room);
    if (!post) {
        return this.goUpgrade();
    }

    if (post.source.energy === 0 && this.creep.lifetime < source.ticksToRegeneration) {
        return this.goUpgrade();
    }
    // todo check creep lifetime, check lives long enough to reach target.
    this.creep.memory.targetId = post.source.id;
    state.switchToMovePos(
        this.creep,
        post.pos,
        gc.RANGE_TRANSFER,
        gc.STATE_HARVESTER_HARVEST,
    );
}

State.prototype.goUpgrade = function () {
    this.creep.targetId = this.creep.room.controller.id;
    const controllerFlag = Game.flags[this.creep.room.controller.id];
    let ccPos = gf.roomPosFromPos(controllerFlag.memory.container);

    this.creep.say("go upgrade")
    return state.switchToMovePos(
        this.creep,
        ccPos,
        gc.RANGE_TRANSFER,
        gc.STATE_UPGRADER_UPGRADE
    );
}

module.exports = State;































