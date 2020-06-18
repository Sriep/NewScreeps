/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const policy = require("policy");
const budget = require("budget");
const race = require("race");
const flag = require("flag");
const state = require("state");
const PolicyBase = require("policy_base");
const FlagRoom = require("flag_room");

class PolicyHarvesters extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_HARVESTERS;
    }

    enact() {
        console.log("POLICY_HARVESTERS enact budget", JSON.stringify(this.budget()));
        const room = Game.rooms[this.home];

        flag.getSpawnQueue(this.home).clearMy(this.parentId);
        const workers = policy.getCreeps(this.parentId, gc.RACE_WORKER).length;
        const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;

        const cWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, CARRY);
        console.log("workers", workers,"ph spawning workers life", cWorkerLife,"CREEP_LIFE_TIME/10",CREEP_LIFE_TIME/10);

        //if (cWorkerLife < CREEP_LIFE_TIME/10) {

        if (workers < 2) {
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

        const budgetHarvesterWsLt = this.harvesterWsRoom(false)*CREEP_LIFE_TIME;
        //const budgetHarvesterWsLt = budget.harvesterWsRoom(room, false)*CREEP_LIFE_TIME;

        const rationHtoW = budget.workersRoomRationHtoW(room, room,false);

        //const wHProportionOfBudget = wHarvesterLife/budgetHarvesterWsLt;
        console.log("ph cWorkerLife",cWorkerLife,"wHarvesterLife",wHarvesterLife,"rationHtoW",rationHtoW,"rationHtoW*wHarvesterLife",rationHtoW*wHarvesterLife);
        if (this.isHarvestContainer(room)) {
            if (cWorkerLife < rationHtoW*wHarvesterLife) {
                policy.sendOrderToQueue(
                    room,
                    gc.RACE_WORKER,
                    room.energyAvailable,
                    this.parentId,
                    gc.SPAWN_PRIORITY_LOCAL
                );
            }
        }

        console.log("ph wHarvesterLife",wHarvesterLife,"budgetHarvesterWsLt",budgetHarvesterWsLt);
        console.log("harvesters",harvesters,"countHarvesterPosts",this.countHarvesterPosts(room));
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

    isHarvestContainer(room) {
        const fRoom = new FlagRoom(room.name);
        for (let sourceId in fRoom.sources) {
            const pos = fRoom.getSourceContainerPos(sourceId);
            if (pos && state.findContainerAt(gf.roomPosFromPos(pos))) {
                return true;
            }
        }
        return false;
    }

    localBudget() {
        //return budget.harvesterRoom(Game.rooms[this.home]);
    };

    budget() {
        //return budget.harvesterRoom(Game.rooms[this.home]);
    };

    harvesterWsRoom(useRoad) {
        useRoad = !!useRoad;
        if (this.m.harvesterWsRoom && this.m.harvesterWsRoom[useRoad]) {
            return this.m.harvesterWsRoom[useRoad]
        } else {
            this.m.harvesterWsRoom = {};
            this.m.harvesterWsRoom[true] = budget.harvesterWsRoom(Game.rooms[this.home], true);
            this.m.harvesterWsRoom[false] = budget.harvesterWsRoom(Game.rooms[this.home], false);
        }
    };

}



module.exports = PolicyHarvesters;


























