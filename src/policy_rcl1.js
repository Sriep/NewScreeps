/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");
const flag = require("flag");
const race = require("race");
const race_worker = require("race_worker");

function Policy  (data) {
    this.type = gc.POLICY_RCL1;
    this.id = data.id;
    this.parentId = data.parentId;
    this.home = Memory.policies[this.parentId].roomId;
    //console.log("POLICY_RCL1 construtor end", JSON.stringify(this))
}

Policy.prototype.initilise = function () {
    //console.log("POLICY_RCL1 initilise start")
    const queue = flag.getSpawnQueue(this.home);
    queue.clear();
    queue.halt(gc.SPAWN_PRIORITY_LOCAL);
    //console.log("initilise end")
    return true;
};

Policy.prototype.enact = function () {
    const policyId = this.parentId;
    const room = Game.rooms[this.home];

    const energy = room.energyAvailable;
    if (energy >= race_worker.WMC_COST) {
        console.log("send order roomenergy >= race_worker.WMC_COST energy", energy);
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            energy,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    const creeps = policy.getCreeps(policyId, gc.RACE_WORKER);
    let lifeLeft = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, WORK);

    const ticksToUpgrade = room.controller.progressTotal - room.controller.progress;
    const trips = Math.ceil(ticksToUpgrade/CARRY_CAPACITY);
    // 175 and 50 just guesses.
    if (lifeLeft < 175 * trips + 50*creeps.length) {
        const orders = flag.getSpawnQueue(this.home).orders(this.parentId, gc.SPAWN_PRIORITY_CRITICAL);
        console.log("spwan queues orders", JSON.stringify(orders));
        if (orders.length === 0 ){
            console.log("rc1 send order orders.length === 0 lifeLeft", lifeLeft);
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                gc.WMC_COST,
                this.parentId,
                gc.SPAWN_PRIORITY_CRITICAL
            );
        }
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;

































