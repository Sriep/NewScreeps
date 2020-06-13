/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");
const flag = require("flag");
const PolicyBase = require("policy_base");

class PolicyRcl1 extends PolicyBase {
    constructor(id, data) {
        super(id, data);
        this.type = gc.POLICY_RCL1;
    }

    initilise() {
        super.initilise();
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

    draftReplacement() {
        return Game.rooms[this.home].controller.level === 1 ? this : false;
    };
}



module.exports = PolicyRcl1;

































