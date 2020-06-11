/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");
const flag = require("flag");

class PolicyRcl1  {
    constructor(id, data) {
        this.id = id;
        this.type = gc.POLICY_RCL1;
        this.parentId = data.parentId;
        this.home = data.home;
        this.m = data;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.home = Memory.policies[this.parentId].roomName;
        const queue = flag.getSpawnQueue(this.home);
        queue.clear();
        queue.halt(gc.SPAWN_PRIORITY_LOCAL);
        return true;
    };

    enact() {
        //console.log("POLICY_RCL1 enact");
        const room = Game.rooms[this.home];

        const energy = room.energyAvailable;
        if (energy >= gc.WMC_COST) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                energy,
                this.parentId,
                gc.SPAWN_PRIORITY_CRITICAL
            );
        }
    };

    localBudget() {
        //return budget.harvesterRoom(Game.rooms[this.home]);
    };

    budget() {
        return { "net energy" : 0, "parts" : 0 };
    };

    draftReplacment() {
        return Game.rooms[this.home].controller.level === 1 ? this : false;
    };
}



module.exports = PolicyRcl1;

































