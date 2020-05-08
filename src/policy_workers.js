/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");
const flag = require("flag");
const race = require("race");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_WORKERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    flag.getSpawnQueue(this.home).clear();
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_WORKERS enact");
    const room = Game.rooms[this.home];
    const policyId = this.parentId;
    const orders = flag.getSpawnQueue(this.home).orders(policyId, gc.SPAWN_PRIORITY_LOCAL);
    console.log("pw orders length", orders.length);
    if (orders.length > 1) {
        return;
    }

    const creeps = policy.getCreeps(policyId, gc.RACE_WORKER);
    const workers = creeps.length;
    if (workers > economy.totalSourceAccessPointsRoom(room)+1) { // +2 guess
        conosle.log("pw accespoints ",economy.totalSourceAccessPointsRoom(room), "skipping")
        return;
    }

    const wLife = race.ticksLeftByPart(policyId, gc.RACE_WORKER, WORK);
    console.log("pw workers", workers, "wLife", wLife, "energy", room.energyAvailable);
    if (wLife < CREEP_LIFE_TIME/4 && room.energyAvailable >= gc.WMC_COST) { //guess
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            room.energyAvailable,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    console.log("ps rhs", Math.floor(room.energyAvailable/gc.WMC_COST),
        "=== ", Math.floor(room.energyCapacityAvailable/gc.WMC_COST));
    if (Math.floor(room.energyAvailable/gc.WMC_COST)
            >= Math.floor(room.energyCapacityAvailable/gc.WMC_COST)) {
        console.log("pw workers",workers, "<= acces poitns", economy.totalSourceAccessPointsRoom(room));
        if (workers <= economy.totalSourceAccessPointsRoom(room)) {
            console.log("send order to queue");
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }
};

Policy.prototype.budget = function() {
    return { RESOURCE_ENERGY : 0 };
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;

































