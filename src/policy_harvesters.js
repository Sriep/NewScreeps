/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");

function Policy  (data) {
    this.type = gc.POLICY_HARVESTERS;
    this.id = data.id;
    this.parentId = data.parentId;
    this.home = Memory.policies[this.parentId].roomId;
}

Policy.prototype.initilise = function () {
    flag.getSpawnQueue(this.home).clearMy(this.parentId, SPAWN_PRIORITY_LOCAL);
    return true;
};

Policy.prototype.enact = function () {
    const room = Game.rooms[this.home];
    if (policy.existingOrders()) {
        return;
    }

    const policyId = this.parentId;
    const wWorkerLife = race.ticksLeftByPart(plicyId, gc.RACE_WORKER, WORK);
    if (wWorkerLife < CREEP_LIFE_TIME) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            gc.WMC_COST,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    const energy = room.energyAvailable;
    if (energy < room.energyCapacity) {
        return;
    }

    const wHarvesterLife = race.ticksLeftByPart(policyId, gc.RACE_HARVESTER, WORK);
    const cWorkerLife = race.ticksLeftByPart(policyId, gc.RACE_WORKER, CARRY);
    const budgetHarvesterWsLt = budget.harvesterWsRoom(room, room, false)*CREEP_LIFE_TIME;
    const budgetCsLt = budget.portersCsRoom(room, room, false)*CREEP_LIFE_TIME;

    const wHProportionOfBudget = wHarvesterLife/budgetHarvesterWsLt;
    const cToSupportExistingWLt = budgetCsLt * wHProportionOfBudget;

    if (cWorkerLife < cToSupportExistingWLt) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            energy,
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }

    if (wHarvesterLife<budgetHarvesterWsLt) {
        const harvesters = policy.getCreeps(policyId, gc.RACE_HARVESTER);
        if (harvesters < state.countHarvesterPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                energy,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;


























