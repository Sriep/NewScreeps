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
    console.log(this.creep.name,"STATE_HARVESTER_IDLE")
    const home = Game.rooms[this.homeId];
    const wsHarvesting = state.wsHarvesting(this.creep.memory.policyId)
    const wBudget = budget.harvesterWsRoom(home, home);
    console.log("wsHarvesting",wsHarvesting,">= wBudget", wBudget);

    if (wsHarvesting >= wBudget) {
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        if (UpgradecontainerPos) {
            const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId))
            if (upgradeContainer) {
                return this.goUpgrade();
            } else {
                return
            }
        }
    }
    sourceId = state.atHarvestingPostWithUndepletedSourceId(this.creep.pos);
    if (sourceId) {
        harvesters = state.getHarvestingHarvesters(this.creep.policyId)
        for (let i in harvesters) {
            if (harvester.memory.targetPos.x === this.creep.x
                && harvester.memory.targetPos.y === this.creep.y) {
                delete harvester.memory.targetPos;
                state.switchTo(harvester, gc.STATE_HARVESTER_IDLE);
            }
        }
        this.creep.memory.targetId = sourceId;
        this.creep.memory.targetPos = this.creep.pos;
        return state.switchTo(this.creep, gc.STATE_HARVESTER_HARVEST);
    }

    if (state.atUpgradingPost(this.creep.pos)) {
        cosole.log("at UpgradingPost", JSON.stringify(this.creep.pos))
        harvesters = state.getHarvestingHarvesters(this.creep.policyId)
        for (let i in harvesters) {
            if (harvester.memory.targetPos.x === this.creep.x
                && harvester.memory.targetPos.y === this.creep.y) {
                delete harvester.memory.targetPos;
                state.switchTo(harvester, gc.STATE_HARVESTER_IDLE);
            }
        }
        this.creep.memory.targetId = home.controller.id;
        this.creep.memory.targetPos = this.creep.pos;
        return state.switchTo(this.creep, gc.STATE_HARVESTER_HARVEST);
    }

    const post = state.findFreeHarvesterPost(home);
    if (!post) {
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        if (UpgradecontainerPos) {
            const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId))
            if (upgradeContainer) {
                return this.goUpgrade();
            } else {
                return
            }
        }
        return;
    }
    //console.log("source post",JSON.stringify(post))
    if (post.source.energy === 0 && this.creep.lifetime < source.ticksToRegeneration) {
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        if (UpgradecontainerPos) {
            const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId))
            if (upgradeContainer) {
                return this.goUpgrade();
            } else {
                this.creep.suicide()
            }
        }

    }
    // todo check creep lifetime, check lives long enough to reach target.
    this.creep.memory.targetId = post.source.id;
    if (!post.source.id) {
        //console.log("STATE_HARVESTER_IDLE post", JSON.stringify(post));
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
    //this.creep.say("go upgrade")
    return state.switchToMovePos(
        this.creep,
        gf.roomPosFromPos({x: post.x, y:post.y, roomName: post.roomName}),
        0,
        gc.STATE_UPGRADER_UPGRADE
    );
}

module.exports = State;































