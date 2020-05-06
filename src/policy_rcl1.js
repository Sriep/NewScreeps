/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const flag = require("flag");
const race = require("race");
const race_worker = require("race_worker")

function Policy  (data) {
    this.type = gc.POLICY_RCL1;
    this.id = data.id;
    this.parentId = data.parentId;
    this.home = Memory.policies[this.parentId].roomId;
}

Policy.prototype.initilise = function () {
    const queue = flag.getSpawnQueue(this.home);
    queue.clear();
    queue.halt(gc.SPAWN_PRIORITY_LOCAL);
};

Policy.prototype.enact = function () {
    const policyId = this.parentId;
    const room = Game.rooms[this.home];

    const energy = room.energyAvailable;
    if (energy >= race_worker.WMC_COST) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            gc.energy,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }

    const creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && race.getRace(c) === gc.RACE_WORKER
    });
    let lifeLeft = 0;
    for (let i in creeps) {
        lifeLeft += creeps[i].ticksToLive;
    }
    // 600 and 50 just guesses.
    if (lifeLeft < 600+50*creeps.length) {
        const orders = flag.getSpawnQueue(this.home).myOrders(this.parentId, gc.SPAWN_PRIORITY_CRITICAL);
        if (orders.length === 0 ){
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
    const rcl = Game.rooms[this.home].controller.level;
    if (rcl > 1) {
        flag.getSpawnQueue(this.home).halt(gc.SPAWN_PRIORITY_COUNT);
        const policyWorkers = require("policy_worker");
        return new policyWorkers({parentId: this.parentId})
    }
    return this
};

module.exports = Policy;