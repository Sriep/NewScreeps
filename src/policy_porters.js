/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");
const budget = require("budget");
const state = require("state");
const race = require("race");
const flag = require("flag");

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
    //console.log("POLICY_PORTERS enact budget", JSON.stringify(this.budget()));
    const room = Game.rooms[this.home];

    flag.getSpawnQueue(this.home).clearMy(this.parentId);

    const wWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, WORK);
    if (wWorkerLife < CREEP_LIFE_TIME/10) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            room.energyAvailable,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }
    if (room.energyAvailable < room.energyCapacityAvailable) {
        return;
    }

    const wHarvesterLife = race.ticksLeftByPart(this.parentId, gc.RACE_HARVESTER, WORK);
    const cWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, CARRY);
    const cPorterLife = race.ticksLeftByPart(this.parentId, gc.RACE_PORTER, CARRY);
    const budgetHarvesterWsLt = budget.harvesterWsRoom(room, room, false)*CREEP_LIFE_TIME;
    const portersCsRoomLT = budget.portersCsRoom(room,room,false)*CREEP_LIFE_TIME;

    const cLife = cWorkerLife + cPorterLife;
    const harvestingWs = Math.min(wHarvesterLife, budgetHarvesterWsLt);

    const buildTicksNeeded = economy.constructionLeft(room) / BUILD_POWER;
    //console.log("pp clife",cLife,"harvestingWs", harvestingWs);
    if (cLife < harvestingWs) {
        // todo 1.5 guess, need to average time from constructions to source,
        // and estimate repairs.
        const guessBuldTicksToWorkerTicks = 1.5;
        //console.log("pp cWorkerLife",cWorkerLife,"buildTicksNeeded",buildTicksNeeded);
        if (cWorkerLife < guessBuldTicksToWorkerTicks*buildTicksNeeded+CREEP_LIFE_TIME/2) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        } else {
            policy.sendOrderToQueue(
                room,
                gc.RACE_PORTER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }

    //console.log("pp wHarvesterLife", wHarvesterLife, "budgetHarvesterWsLt", budgetHarvesterWsLt)
    if (wHarvesterLife<budgetHarvesterWsLt) {
        const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
        //console.log("pp harvesters", harvesters,"posts",state.countHarvesterPosts(room).length);
        if (harvesters < state.countHarvesterPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }

    //console.log("cLife",clife, "< portersCsRoomLT", portersCsRoomLT);
    if (cLife < portersCsRoomLT) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_PORTER,
            room.energyCapacityAvailable,
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }

    const budgetUpgradersWsLt = budget.upgradersWsRoom(room, room.energyCapacityAvailable, false)*CREEP_LIFE_TIME
                                - buildTicksNeeded/HARVEST_POWER; //todo factor in repairs
    const wUpgradersLife = wHarvesterLife-budgetHarvesterWsLt;
    //console.log("pp wUpgradersLife", wUpgradersLife, "budgetUpgradersWsLt", budgetUpgradersWsLt)
    if (wUpgradersLife < budgetUpgradersWsLt) {
        //console.log("pp harvesters",harvesters, "hposts", state.countHarvesterPosts(room).length,
        //    "uposts", state.countUpgraderPosts(room).length);
        const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
        if (harvesters < state.countHarvesterPosts(room).length
                        + state.countUpgraderPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }
};

Policy.prototype.budget = function() {
    return budget.porterRoom(Game.rooms[this.home]);
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;



















