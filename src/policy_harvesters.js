/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
const budget = require("budget");
const race = require("race");
const flag = require("flag");
const PolicyBase = require("policy_base");

class PolicyHarvesters extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_HARVESTERS;
    }

    enact() {
        console.log("POLICY_HARVESTERS enact budget", JSON.stringify(this.budget()));
        const room = Game.rooms[this.home];

        flag.getSpawnQueue(this.home).clearMy(this.parentId);

        const cWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, CARRY);
        //console.log("ph spawning workers life", cWorkerLife,"CREEP_LIFE_TIME/10",CREEP_LIFE_TIME/10);
        if (cWorkerLife < CREEP_LIFE_TIME/10) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_CRITICAL
            );
            return;
        }

        if (room.energyAvailable < room.energyCapacity) {
            return;
        }

        const wHarvesterLife = race.ticksLeftByPart(this.parentId, gc.RACE_HARVESTER, WORK);
        console.log("ph cWorkerLife",cWorkerLife,"wHarvesterLife",wHarvesterLife);
        const budgetHarvesterWsLt = budget.harvesterWsRoom(room, false)*CREEP_LIFE_TIME;
        const rationHtoW = budget.workersRoomRationHtoW(room, room,false);

        //const wHProportionOfBudget = wHarvesterLife/budgetHarvesterWsLt;
        //console.log("ph cWorkerLife",cWorkerLife,"wHarvesterLife",wHarvesterLife,"rationHtoW",rationHtoW,"rationHtoW*wHarvesterLife",rationHtoW*wHarvesterLife)
        if (cWorkerLife < rationHtoW*wHarvesterLife) {
            //console.log("build worker");
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }

        //console.log("ph wHarvesterLife",wHarvesterLife,"budgetHarvesterWsLt",budgetHarvesterWsLt);
        if (wHarvesterLife < budgetHarvesterWsLt) {
            const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
            if (harvesters < this.countHarvesterPosts(room)) {
                policy.sendOrderToQueue(
                    room,
                    gc.RACE_HARVESTER,
                    room.energyAvailable,
                    this.parentId,
                    gc.SPAWN_PRIORITY_LOCAL
                );
            }
        }
    };

    countHarvesterPosts(room) {
        const fRoom = new FlagRoom(room.name);
        let posts = 0;
        for (let sourceId in fRoom.sources) {
            if (fRoom.getSourcePosts(sourceId)) {
                posts += fRoom.getSourcePosts(sourceId).length;
            }
        }
        return posts;
    };

    localBudget() {
        //return budget.harvesterRoom(Game.rooms[this.home]);
    };

    budget() {
        //return budget.harvesterRoom(Game.rooms[this.home]);
    };

}



module.exports = PolicyHarvesters;


























