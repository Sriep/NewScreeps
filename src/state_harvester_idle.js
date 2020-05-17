/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
//const gf = require("gf");
const state = require("state");
const policy = require("policy");
//const budget = require("budget");

function State (creep) {
    this.creep = creep;
    this.state = gc.STATE_HARVESTER_IDLE;
    this.policyId = creep.memory.policyId;
    this.m = this.creep.memory;
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    //console.log(this.creep.name, "STATE_HARVESTER_IDLE");
    const home = Game.rooms[this.homeId];

    const governor = policy.getGouvernerPolicy(this.homeId);
    const nextPost = state.nextFreeHarvesterPost(
        this.homeId,
        governor.getColonies(),
        home.energyCapacityAvailable
    );
    if (nextPost) {
        this.m.targetId = nextPost.sourceId;
        state.switchToMovePos(
            this.creep,
            nextPost.post,
            0,
            gc.STATE_HARVESTER_HARVEST,
        );
    }
};
/*
State.prototype.enactOld = function () {
    //console.log(this.creep.name,"STATE_HARVESTER_IDLE")
    const home = Game.rooms[this.homeId];
    const wsHarvesting = state.wsHarvesting(this.creep.memory.policyId);
    const wBudget = budget.harvesterWsRoom(home, home);
    //console.log("wsHarvesting",wsHarvesting,">= wBudget", wBudget);
    if (wsHarvesting >= wBudget) {
        const UpgradePost = state.findFreeUpgraderPost(home);
        if (UpgradePost) {
            return this.goUpgrade(UpgradePost);
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
        const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId));
        //console.log("at upgrading post with energy", upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0)
        if (upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
            harvesters = state.getHarvestingHarvesters(this.creep.policyId);
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
        return this.goUpgrade();
    }

    if (post.source && post.source.energy === 0 && this.creep.lifetime < post.source.ticksToRegeneration) {
        return this.goUpgrade();
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
};

State.prototype.goUpgrade = function (post) {
    const home = Game.rooms[this.homeId];
    if (!post) {
        post =  state.findFreeUpgraderPost(home);
    }
    if (!post) {
        //console.log(this.creep.name,"stuck in goUpgrade")
        //creep.say("help do?")
        //this.creep.suicide;
        //console.log(this.creep.name,"suicide ------------------to many creeps?");
        return;
    }
    this.creep.targetId = home.controller.id;
    const newPos = gf.roomPosFromPos({x: post.x, y:post.y, roomName: home.name});
    return state.switchToMovePos(
        this.creep,
        newPos,
        0,
        gc.STATE_UPGRADER_UPGRADE
    );
};
*/
module.exports = State;































