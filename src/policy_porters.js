/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_PORTERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_PORTERS enact");
    const room = Game.rooms[this.home];
    if (policy.existingOrders()) {
        return;
    }

    const policyId = this.m.parentId;
    const wWorkerLife = race.ticksLeftByPart(plicyId, gc.RACE_WORKER, WORK);
    if (wWorkerLife < CREEP_LIFE_TIME/10) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            room.energyAvailable,
            this.m.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    //const energy = room.energyAvailable;
    if (room.energyAvailable < room.energyCapacity) {
        console.log("ph energy",room.energyAvailable, "too low cap", room.energyCapacity)
        return;
    }

    const wHarvesterLife = race.ticksLeftByPart(policyId, gc.RACE_HARVESTER, WORK);
    const cWorkerLife = race.ticksLeftByPart(policyId, gc.RACE_WORKER, CARRY);
    const cPorterLife = race.ticksLeftByPart(policyId, gc.RACE_PORTER, CARRY);
    const budgetHarvesterWsLt = budget.harvesterWsRoom(room, room, false)*CREEP_LIFE_TIME;

    const cLife = cWorkerLife + cPorterLife;
    const harvestingWs = Math.min(wHarvesterLife, budgetHarvesterWsLt);

    const buildTicksNeeded = economy.constructionLeft(room) / BUILD_POWER;
    console.log("pp clife",cLife,"harvestingWs", harvestingWs)
    if (cLife < harvestingWs) {
        // todo 1.5 guess, need to average time from constructions to source,
        // and estimate repairs.
        const guessBuldTicksToWorkerTicks = 1.5;
        console.log("pp cWorkerLife",cWorkerLifem,"buildTicksNeeded",buildTicksNeeded)
        if (cWorkerLife < guessBuldTicksToWorkerTicks*buildTicksNeeded+CREEP_LIFE_TIME/2) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyAvailable,
                this.m.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        } else {
            policy.sendOrderToQueue(
                room,
                gc.RACE_PORTER,
                room.energyAvailable,
                this.m.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }

    console.log("pp wHarvesterLife", wHarvesterLife, "budgetHarvesterWsLt", budgetHarvesterWsLt)
    if (wHarvesterLife<budgetHarvesterWsLt) {
        const harvesters = policy.getCreeps(policyId, gc.RACE_HARVESTER);
        console.log("pp harvesters", harvesters,"posts",state.countHarvesterPosts(room).length);
        if (harvesters < state.countHarvesterPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                room.energyAvailable,
                this.m.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }

    const budgetUpgradersWsLt = budget.upgradersWsRoom(room, room, false)*CREEP_LIFE_TIME
                                - buildTicksNeeded/HARVEST_POWER; //todo factor in repairs
    const wUpgradersLife = wHarvesterLife-budgetHarvesterWsLt;
    conosle.log("pp wUpgradersLife", wUpgradersLife, "budgetUpgradersWsLt", budgetUpgradersWsLt)
    if (wUpgradersLife < budgetUpgradersWsLt) {
        console.log("pp harvesters",harvesters, "hposts", state.countHarvesterPosts(room).length,
            "uposts", state.countUpgraderPosts(room).length);
        if (harvesters < state.countHarvesterPosts(room).length
                        + state.countUpgraderPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                energy,
                this.m.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;



















