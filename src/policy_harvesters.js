/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
//const policy = require("policy");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_HARVESTERS;
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
    console.log("POLICY_HARVESTERS enact");
    const room = Game.rooms[this.home];
    //if (policy.existingOrders()) {
    //    return;
    //}

    const policyId = this.m.parentId;
    const wWorkerLife = race.ticksLeftByPart(plicyId, gc.RACE_WORKER, WORK);
    if (wWorkerLife < CREEP_LIFE_TIME/10) {
        console.log("ph spawning workers life", wWorkerLife);
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            room.energyAvailable,
            this.m.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    if (room.energyAvailable < room.energyCapacity) {
        console.log("ph energy",room.energyAvailable, "too low cap", room.energyCapacity)
        return;
    }

    const wHarvesterLife = race.ticksLeftByPart(policyId, gc.RACE_HARVESTER, WORK);
    const cWorkerLife = race.ticksLeftByPart(policyId, gc.RACE_WORKER, CARRY);
    const budgetHarvesterWsLt = budget.harvesterWsRoom(room, room, false)*CREEP_LIFE_TIME;
    const budgetCsLt = budget.portersCsRoom(room, room, false)*CREEP_LIFE_TIME;

    const wHProportionOfBudget = wHarvesterLife/budgetHarvesterWsLt;
    const cToSupportExistingWLt = budgetCsLt * wHProportionOfBudget;
    console.log("ph cWorkerLife",cWorkerLife,"cToSupportExistingWLt",cToSupportExistingWLt);
    if (cWorkerLife < cToSupportExistingWLt) {
        const workers = policy.getCreeps(policyId, gc.RACE_WORKER);
        console.log("ph workers", workers, "acces points",
            economy.totalSourceAccessPointsRoom(room), "h posts",
            state.countHarvesterPosts(room).length);
        if (workers <= economy.totalSourceAccessPointsRoom(room)
                - state.countHarvesterPosts(room).length ) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyAvailable,
                this.m.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }

    }
    console.log("ph wHarvesterLife",wHarvesterLife,"budgetHarvesterWsLt",budgetHarvesterWsLt);
    if (wHarvesterLife<budgetHarvesterWsLt) {
        const harvesters = policy.getCreeps(policyId, gc.RACE_HARVESTER);
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
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;


























