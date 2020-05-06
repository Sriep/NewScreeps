/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");

function Policy  (data) {
    this.type = gc.POLICY_WORKERS;
    this.id = data.id;
    this.parentId = data.parentId;
    this.home = Memory.policies[this.parentId].roomId;
}

Policy.prototype.initilise = function () {
    flag.getSpawnQueue(this.home).clearMy(this.parentId);
    return true;
};

Policy.prototype.enact = function () {
    const room = Game.rooms[this.home];
    if (policy.existingOrders()) {
        return;
    }

    const policyId = this.parentId;
    const orders = queue.orders(policyId, gc.SPAWN_PRIORITY_LOCAL);
    if (orders > 1) {
        return;
    }

    const energy = room.energyAvailable;
    const creeps = policy.getCreeps(policyId, gc.RACE_WORKER);

    const workers = creeps.length;
    if (workers > economy.totalSourceAccessPointsRoom(room)+2) { // +2 guess
        return;
    }

    const wLife = race.ticksLeftByPart(policyId, gc.RACE_WORKER, WORK);
    if (wLife < CREEP_LIFE_TIME/2 && energy >= gc.WMC_COST) { //guess
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            energy,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    if (Maths.floor(energy/gc.WMC_COST)
            === Maths.floor(room.energyCapacityAvailable/gc.WMC_COST)) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            energy,
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;

































