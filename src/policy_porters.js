/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");
const budget = require("budget");
const state = require("state");
const race = require("race");
const flag = require("flag");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_PORTERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
    this.m.resources;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    return true;
};

Policy.prototype.enact = function () {
    // this.localSpawns();
    const room = Game.rooms[this.home];
    if (!this.m.resources || Game.time + this.id % gc.CALC_ROOM_RESOURCES_RATE !== 0 ) {
        if (room.controller < 3) {
            this.m.resources = this.calcResources(gc.ROOM_NEUTRAL, gc.ROOM_NEUTRAL_ROADS);
        } else {
            this.m.resources = this.calcResources(gc.ROOM_RESERVED, gc.ROOM_RESERVED_ROADS);
        }
    }
    this.spawns(room, this.m.resources);
};

Policy.prototype.spawns = function (room, resources) {
    const wHarvesterLife = race.ticksLeftByPart(this.parentId, gc.RACE_HARVESTER, WORK);
    const cWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, CARRY);
    const cPorterLife = race.ticksLeftByPart(this.parentId, gc.RACE_PORTER, CARRY);
    const min = Math.min(wHarvesterLife, cWorkerLife, cPorterLife);

    if (wHarvesterLife === min
        && wHarvesterLife/CREEP_LIFE_TIME < resources.hW + resources.uW) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_HARVESTER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }

    if (cWorkerLife === min && cWorkerLife/CREEP_LIFE_TIME < resources.wWC) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }

    if (cPorterLife === min && cPorterLife/CREEP_LIFE_TIME < resources.pC) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_PORTER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }
};

Policy.prototype.calcResources = function (roomType1, roomType2) {
    let harvesterWs = budget.harvesterWsRoom(room, room, false);
    let porterCs = budget.harvesterWsRoom(room, room, false);
    let upgradeWs =  budget.upgradersWsRoom(room, gf.roomEc(room));
    let buildTicks = economy.constructionLeft(room) / BUILD_POWER;
    let ratioHtoW = budget.workersRoomRationHtoW(room, room);
    porterCs -= (porterCs/harvesterWs) * (buildTicks / CREEP_LIFE_TIME);
    let workerWs = ratioHtoW * buildTicks / CREEP_LIFE_TIME;

    const colonies = Memory.policies[this.parentId].colonies;
    for (let colony of colonies) {
        const flagRoom = Game.flags[colony];
        const valuesObj = flagRoom.memory.values[this.home];
        let values;
        if(valuesObj[roomType1].profit > valuesObj[roomType2].profit) {
            values = valuesObj[roomType1];
        } else {
            values = valuesObj[roomType2];
        }
        let hW=0, pC=0, uW=0;
        for (let id in values["sources"]) {
            if (values["sources"][id].netEnergy > gc.COLONY_PROFIT_MARGIN) {
                hW += values["sources"][id].parts.hW;
                pC += values["sources"][id].parts.pC;
                uW += values["sources"][id].parts.uW
            }
        }
        const room = Game.rooms[colony];
        const ratioHtoW = budget.workersRoomRationHtoW(room, Game.rooms[this.home]);
        buildTicks += economy.constructionLeft(room) / BUILD_POWER;
        porterCs -= (pC/hW) * (ratioHtoW*buildTicks / CREEP_LIFE_TIME);
        workerWs += ratioHtoW*buildTicks / CREEP_LIFE_TIME;

        harvesterWs += hW;
        porterCs += pC;
        upgradeWs += uW;
    }

    return { "hW": harvesterWs, "pC": porterCs, "uW": upgradeWs, "wWC": workerWs }
};

Policy.prototype.localSpawns = function () {
    console.log("POLICY_PORTERS enact budget", JSON.stringify(this.budget()));
    const room = Game.rooms[this.home];

    flag.getSpawnQueue(this.home).clearMy(this.parentId);

    const wWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, WORK);
    if (wWorkerLife < CREEP_LIFE_TIME/10) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            room.energyAvailable,
            this.parentId,
            gc.SPAWN_PRIORITY_CRITICAL
        );
        return;
    }
    if (room.energyAvailable < gf.roomEc(room)) {
        return;
    }

    const wHarvesterLife = race.ticksLeftByPart(this.parentId, gc.RACE_HARVESTER, WORK);
    const cWorkerLife = race.ticksLeftByPart(this.parentId, gc.RACE_WORKER, CARRY);
    const cPorterLife = race.ticksLeftByPart(this.parentId, gc.RACE_PORTER, CARRY);
    const budgetHarvesterWsLt = budget.harvesterWsRoom(room, room, false)*CREEP_LIFE_TIME;
    const budgetPortersCsRoomLT = budget.portersCsRoom(room,room,false)*CREEP_LIFE_TIME;

   // const cPWLife = cWorkerLife + cPorterLife;
    const harvestingWs = Math.min(wHarvesterLife, budgetHarvesterWsLt);

    const buildTicksNeeded = economy.constructionLeft(room) / BUILD_POWER;
    console.log("pp cPWLife",cPWLife,"harvestingWs", harvestingWs);

    const harvestLifeNeededForBuilding = buildTicksNeeded/2;
    const harvesterLifeRemaining = wHarvesterLife - harvestLifeNeededForBuilding;
    const ratioHtoW = budget.workersRoomRationHtoW(room, false);
    const ratioHtoP = budgetHarvesterWsLt/budgetPortersCsRoomLT;
    const ratioWtoP = ratioHtoP/ratioHtoW;
    const wsProportionBuild = budgetHarvesterWsLt/harvestLifeNeededForBuilding;

    console.log("pp cWorkerLife", cWorkerLife, "ratioHtoW", ratioHtoW,
        "wHarvesterLife",wHarvesterLife,"harvestLifeNeededForBuilding",harvestLifeNeededForBuilding);
    if (cWorkerLife < ratioHtoW*Math.min(wHarvesterLife, harvestLifeNeededForBuilding)) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }
    console.log("ph cPorterLife",cPorterLife,"ratioHtoP",ratioHtoP,
        "harvesterLifeRemaiming",harvesterLifeRemaining);
    if (cPorterLife < ratioHtoP*harvesterLifeRemaining) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_PORTER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }

    console.log("pp wHarvesterLife", wHarvesterLife, "budgetHarvesterWsLt", budgetHarvesterWsLt);
    if (wHarvesterLife<budgetHarvesterWsLt) {
        const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
        if (harvesters < state.countHarvesterPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                gf.roomEc(room),
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }

    console.log("cPWLife",cPWLife, "ratioWtoP",ratioWtoP, "< portersCsRoomLT", portersCsRoomLT);
    if (cPorterLife < wsProportionBuild*portersCsRoomLT) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_PORTER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }

    const budgetUpgradersWsLt = budget.upgradersWsRoom(room, gf.roomEc(room), false)*CREEP_LIFE_TIME
                                - buildTicksNeeded/HARVEST_POWER; //todo factor in repairs
    const wUpgradersLife = wHarvesterLife-budgetHarvesterWsLt;
    //console.log("pp wUpgradersLife", wUpgradersLife, "budgetUpgradersWsLt", budgetUpgradersWsLt)
    if (wUpgradersLife < budgetUpgradersWsLt) {
        //console.log("pp harvesters",harvesters, "hposts", state.countHarvesterPosts(room).length,
        //    "uposts", state.countUpgraderPosts(room).length);
        const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
        if (harvesters < state.countHarvesterPosts(room).length
                        + state.countUpgraderPosts(room).length) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                gf.roomEc(room),
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }
};

Policy.prototype.budget = function() {
    return budget.porterRoom(Game.rooms[this.home]);
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;



















