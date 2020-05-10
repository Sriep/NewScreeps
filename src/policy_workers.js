/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");
const flag = require("flag");
const budget = require("budget");
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
    for (let id in Memory.policies) {
        if (id !== this.id && Memory.policies[id].type === gc.POLICY_WORKERS) {
            console.log("Worker policy", JSON.stringify(this));
            gf.fatalError("two worker policies");
        }
    }
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_WORKERS enact budget room", JSON.stringify(this.budget()));
    const room = Game.rooms[this.home];
    const policyId = this.parentId;
    const orders = flag.getSpawnQueue(this.home).orders(policyId, gc.SPAWN_PRIORITY_LOCAL);
    //console.log("pw orders length", orders.length);
    if (orders.length > 1) {
        return;
    }

    const creeps = policy.getCreeps(policyId, gc.RACE_WORKER).length;
    const workers = creeps.length;
    if (workers > this.equilibriumWorkers()) { // +2 guess
        console.log("pw accespoints ",economy.totalSourceAccessPointsRoom(room), "skipping");
        return;
    }

    const wLife = race.ticksLeftByPart(policyId, gc.RACE_WORKER, WORK);
    //console.log("pw workers", workers, "wLife", wLife, "energy", room.energyAvailable);
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

    //console.log("ps rhs", Math.floor(room.energyAvailable/gc.WMC_COST),
    //    "=== ", Math.floor(room.energyCapacityAvailable/gc.WMC_COST));
    if (Math.floor(room.energyAvailable/gc.WMC_COST)
            >= Math.floor(room.energyCapacityAvailable/gc.WMC_COST)) {
        console.log("pw workers",workers, "<= acces poitns", economy.totalSourceAccessPointsRoom(room));
        if (workers <= this.equilibriumWorkers()) {
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

Policy.prototype.equilibriumWorkers = function()  {
    return economy.totalSourceAccessPointsRoom(Game.rooms[this.home])+1;
};

Policy.prototype.budget = function() {
    const netEnergy = budget.workerRoom(Game.rooms[this.home], this.equilibriumWorkers());
    return { "net energy" : netEnergy, "parts" :  this.equilibriumWorkers()*3 };
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;

































