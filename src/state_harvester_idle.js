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
    this.creep = creep;
    this.state = gc.STATE_HARVESTER_IDLE;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomId;
}

State.prototype.enact = function () {
    //console.log(this.creep.name,"STATE_HARVESTER_IDLE")
    const home = Game.rooms[this.homeId];
    const wsHarvesting = state.wsHarvesting(this.creep.memory.policyId);
    const wBudget = budget.harvesterWsRoom(home, home);
    //console.log("wsHarvesting",wsHarvesting,">= wBudget", wBudget);

    if (wsHarvesting >= wBudget) {
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        if (UpgradecontainerPos) {
            const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId))
            if (upgradeContainer) {
                //console.log()
                return this.goUpgrade();
            } else {
                return
            }
        }
    }

    sourceId = state.atHarvestingPostWithUndepletedSourceId(this.creep.pos);
    if (sourceId) {
        harvesters = state.getHarvestingHarvesters(this.creep.policyId);
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
        //console.log("at UpgradingPost", JSON.stringify(this.creep.pos))
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId))
        //console.log("at upgrading post with energy", upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0)
        if (upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
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
    }

    const post = state.findFreeHarvesterPost(home);
    //console.log(this.creep.name,"STATE_HARVESTER_IDLE freeharves post", JSON.stringify(post))
    if (!post) {
        const UpgradeContainerPos = Game.flags[home.controller.id].memory.containerPos;
        if (UpgradeContainerPos) {
            const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradeContainerPos, this.homeId));
            if (upgradeContainer) {
                return this.goUpgrade();
            } else {
                return
            }
        }
        return;
    }

    if (post.source && post.source.energy === 0 && this.creep.lifetime < post.source.ticksToRegeneration) {
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        if (UpgradecontainerPos) {
            const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId));
            if (upgradeContainer) {
                return this.goUpgrade();
            } else {
                //console.log(this.creep.name,"suicide ------------------to many creeps?");
                //this.creep.suicide()
                return;
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
        gf.roomPosFromPos({x: post.x, y:post.y, roomName: home.name}),
        0,
        gc.STATE_HARVESTER_HARVEST,
    );
}

State.prototype.goUpgrade = function () {
    const home = Game.rooms[this.homeId];
    const post =  state.findFreeUpgraderPost(home);
    //console.log(this.creep.name,"STATE_HARVESTER_IDLE post found", post.x, post.y);
    if (!post) {
        //console.log(this.creep.name,"stuck in goUpgrade")
        //creep.say("help do?")
        //this.creep.suicide;
        //console.log(this.creep.name,"suicide ------------------to many creeps?");
        return;
    }
    this.creep.targetId = home.controller.id;
    const newPos = gf.roomPosFromPos({x: post.x, y:post.y, roomName: home.name})
    //console.log(this.creep.name, "STATE_HARVESTER_IDLE new post", JSON.stringify(newPos))
    return state.switchToMovePos(
        this.creep,
        newPos,
        0,
        gc.STATE_UPGRADER_UPGRADE
    );
}

module.exports = State;































