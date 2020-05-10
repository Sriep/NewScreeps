/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");
const flag = require("flag");
const race_worker = require("race_worker");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_RCL1;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
    //console.log("POLICY_RCL1 constructor end", JSON.stringify(this));
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    //console.log("POLICY_RCL1 initiliseparentId",this.parentId);
    //console.log('POLICY_RCL1 initilise memroy policies', JSON.stringify(Memory.policies[this.parentId]));
    this.home = Memory.policies[this.parentId].roomName;
    const queue = flag.getSpawnQueue(this.home);
    queue.clear();
    queue.halt(gc.SPAWN_PRIORITY_LOCAL);
    //console.log("policy govern this.m",JSON.stringify(this));
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_RCL1 enact");
    const room = Game.rooms[this.home];

    const energy = room.energyAvailable;
    if (energy >= race_worker.WMC_COST) {
        //console.log("POLICY_RCL1 send order roomenergy >= race_worker.WMC_COST energy", energy);
        //console.log("POLICY_RCL1 room", room.name, "energy", energy,"parentid",
        //    this.parentId, "state", gc.SPAWN_PRIORITY_CRITICAL);
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            energy,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
    }
};

Policy.prototype.budget = function() {
    return { "net energy" : 0, "parts" : 0 };
};

Policy.prototype.draftReplacment = function() {
    console.log("POLICY_RCL1 draftReplacment contorller level", Game.rooms[this.home].controller.level);
    return Game.rooms[this.home].controller.level === 1 ? this : false;
};

module.exports = Policy;

































