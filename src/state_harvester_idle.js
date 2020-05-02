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
    this.policyId = creep.memory.policyId
    this.homeId = Memory.policies[this.policyId].roomId;
}

State.prototype.enact = function () {
    const home = Game.rooms[this.homeId];
    const wsHarvesting = state.wsHarvesting(this.creep.memory.policyId)
    const wBudget = budget.harvesterWsRoom(home, home);

    containerId = Game.flags[home.controller.id].memory.container;
    //console.log(wsHarvesting, "ws vrs harvesters budget",wBudget)
    if (wsHarvesting >= wBudget) {
        //console.log("wsHarvesting >= wBudget")
        if (!!containerId) {
            return this.goUpgrade();
        } else {
            return
        }

    }
    const post = state.findFreeHarvesterPost(home);
    if (!post) {
        //console.log("!post")
        if (!!containerId) {
            return this.goUpgrade();
        } else {
            return
        }
    }
    console.log("source post",JSON.stringify(post))
    if (post.source.energy === 0 && this.creep.lifetime < source.ticksToRegeneration) {
        //console.log("post.source.energy === 0 && this.creep.lifetime < source.ticksToRegeneration");
        if (!!containerId) {
            return this.goUpgrade();
        } else {
            this.creep.suicide()
        }
    }
    // todo check creep lifetime, check lives long enough to reach target.
    this.creep.memory.targetId = post.source.id;
    if (!post.source.id) {
        console.log("STATE_HARVESTER_IDLE post", JSON.stringify(post));
        gf.fatalError(this.creep.name, "no target source id for harvester");
    }

    state.switchToMovePos(
        this.creep,
        gf.roomPosFromPos({x: post.x, y:post.y, roomName: post.roomName}),
        0,
        gc.STATE_HARVESTER_HARVEST,
    );
}

State.prototype.goUpgrade = function () {
    const home = Game.rooms[this.homeId];
    post =  state.findFreeUpgraderPost(home);
    this.creep.targetId = home.controller.id;
    this.creep.say("go upgrade")
    return state.switchToMovePos(
        this.creep,
        gf.roomPosFromPos({x: post.x, y:post.y, roomName: post.roomName}),
        0,
        gc.STATE_UPGRADER_UPGRADE
    );
}

module.exports = State;































