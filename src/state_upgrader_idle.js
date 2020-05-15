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
    this.state = gc.STATE_UPGRADER_IDLE;
    this.policyId = creep.memory.policyId;
    this.m = this.creep.memory;
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    const home = Game.rooms[this.homeId];
    //const wsHarvesting = state.wsHarvesting(this.creep.memory.policyId);
    //const wBudget = budget.harvesterWsRoom(home, home);
    //console.log("wsHarvesting",wsHarvesting,">= wBudget", wBudget);

    const UpgradePost = state.findFreeUpgraderPost(home);
    if (UpgradePost) {
        return this.goUpgrade(UpgradePost);
    }

    if (state.atUpgradingPost(this.creep.pos)) {
        //console.log("at UpgradingPost", JSON.stringify(this.creep.pos))
        const UpgradecontainerPos = Game.flags[home.controller.id].memory.containerPos;
        const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(UpgradecontainerPos, this.homeId));
        //console.log("at upgrading post with energy", upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0)
        if (upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
            upgraders = state.getHarvestingHarvesters(this.creep.policyId);
            for (let i in upgraders) {
                if (upgraders.memory.targetPos.x === this.creep.x
                    && upgraders.memory.targetPos.y === this.creep.y) {
                    delete upgraders.memory.targetPos;
                    state.switchTo(upgraders, gc.STATE_UPGRADER_IDLE);
                }
            }
            this.creep.memory.targetId = home.controller.id;
            this.creep.memory.targetPos = this.creep.pos;
            return state.switchTo(this.creep, gc.STATE_UPGRADER_UPGRADE);
        }
    }
};

State.prototype.goUpgrade = function (post) {
    const home = Game.rooms[this.homeId];
    if (!post) {
        post =  state.findFreeUpgraderPost(home);
    }
    if (!post) {
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

module.exports = State;































