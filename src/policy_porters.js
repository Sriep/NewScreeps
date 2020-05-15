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
const race = require("race");
const flag = require("flag");
const race_harvester = require("race_harvester");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_PORTERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_PORTERS budget", JSON.stringify( budget.porterRoom(Game.rooms[this.home])));
    console.log("POLICY_PORTERS resources", JSON.stringify(this.m.resources));
    const room = Game.rooms[this.home];
    ///if (!this.m.resources || (Game.time + this.id) % gc.CALC_ROOM_RESOURCES_RATE !== 0 ) {
        if (room.controller < 3) {
            this.m.resources = this.calcResources(gc.ROOM_NEUTRAL, gc.ROOM_NEUTRAL_ROADS);
        } else {
            this.m.resources = this.calcResources(gc.ROOM_RESERVED, gc.ROOM_RESERVED_ROADS);
        }
    //}
    this.spawns(room, this.m.resources);
};

Policy.prototype.spawns = function (room, resources) {
    console.log("pp spawns resources", JSON.stringify(resources));

    const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
    const workers = policy.getCreeps(this.parentId, gc.RACE_WORKER).length;
    const porters = policy.getCreeps(this.parentId, gc.RACE_PORTER).length;
    const upgraders = policy.getCreeps(this.parentId, gc.RACE_UPGRADER).length;
    //console.log("pp spawns harvesters",harvesters,"workers",workers,"porters",porters,"upgraders",upgraders);

    const wHarvester = race.creepPartsAlive(this.parentId, gc.RACE_HARVESTER, WORK);
    const cWorker = race.creepPartsAlive(this.parentId, gc.RACE_WORKER, CARRY);
    const cPorter = race.creepPartsAlive(this.parentId, gc.RACE_PORTER, CARRY);
    const wUpgrader = race.creepPartsAlive(this.parentId, gc.RACE_UPGRADER, WORK);
    console.log("pp spawns harvesters",harvesters,"workers",workers,"porters",porters,"upgraders",upgraders,"pp spawns wHarvester",wHarvester,"cWorker",cWorker,"cPorter",cPorter,"wUpgrader",wUpgrader);

    flag.getSpawnQueue(this.home).clearMy(this.parentId);

    if (cWorker < 2) {
        if (cWorker < CREEP_LIFE_TIME/10 || (harvesters === 0 && cPorter === 0 )) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_CRITICAL
            );
            return;
        }
    }

    const canBuildHarvesters =  wHarvester < resources.hW;
    const canBuildWorkers = cWorker < resources.wW;
    const canBuildPorters = cPorter < resources.pC - 0.1;
    const canBuildUpgrader = wUpgrader < resources.uW - 0.1;

    if (room.energyAvailable < room.energyCapacityAvailable) {
        return;
    }

    if (canBuildHarvesters
        && (!canBuildWorkers || wHarvester <= cWorker
        && (!canBuildPorters || wHarvester <= cPorter))) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_HARVESTER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
        return;
    }

    if (canBuildWorkers) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_WORKER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
        return;
    }

    if (canBuildPorters) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_PORTER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
        return
    }

    if (canBuildUpgrader) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_UPGRADER,
            gf.roomEc(room),
            this.parentId,
            gc.SPAWN_PRIORITY_LOCAL
        );
    }
};

Policy.prototype.calcResources = function (roomType1, roomType2) {
    let resources;
    const homeRoom = Game.rooms[this.home];
    const ec = homeRoom.energyCapacityAvailable;

    //let sourceEnergyLT = 0;
    //for (let source of homeRoom.find(FIND_SOURCES)) {
    //    sourceEnergyLT += gc.SORCE_REGEN_LT*source.energyCapacity
    //}
    const sourceEnergyLT = 30000;

    if (ec <= gc.MAX_EC_4WORK_HARVESTER) {
        const hWperBody = race_harvester.bodyCounts(ec)["work"];
        let maxWs = 0;
        for (let source of homeRoom.find(FIND_SOURCES)) {
            let sFlag = Game.flags[source.id];
            const ap = sFlag.memory.accessPoints;
            maxWs += Math.min(5, ap*hWperBody);
        }
        const budgetWs = budget.harvesterWsRoom(homeRoom, homeRoom, false);
        const ratio = maxWs/budgetWs;
        resources = calcRoomResources(
            this.home,
            maxWs,
            ratio * budget.harvesterWsRoom(homeRoom, homeRoom, false),
            ratio * budget.upgradersWsRoom(homeRoom, sourceEnergyLT)
        );
        //console.log("pp ec<=MAX_EC_4WORK_HARVESTER calcResources home", JSON.stringify(resources));
    } else {
        resources = calcRoomResources(
            this.home,
            budget.harvesterWsRoom(homeRoom, homeRoom, false),
            budget.harvesterWsRoom(homeRoom, homeRoom, false),
            budget.upgradersWsRoom(homeRoom, sourceEnergyLT)
        );
        //console.log("pp ec>MAX_EC_4WORK_HARVESTER calcResources home", JSON.stringify(resources));
    }

    this.m.localResoures = resources;

    const governor = policy.getGouvernerPolicy(this.home);
    const colonies = governor.getColonies();
    //console.log("pp colonies", colonies);
    for (let colony of colonies) {
        if (colony === this.home) {
            continue;
        }
        const valuesObj = JSON.parse(Game.flags[this.home].memory[values]);
        let values;
        if(valuesObj[roomType1].profit > valuesObj[roomType2].profit) {
            values = valuesObj[roomType1];
        } else {
            values = valuesObj[roomType2];
        }
        let hW=0, pC=0, uW=0;
        for (let id in values["sources"]) {
            //if (values["sources"][id].netEnergy > gc.COLONY_PROFIT_MARGIN) {
                hW += values["sources"][id].parts.hW;
                pC += values["sources"][id].parts.pC;
                uW += values["sources"][id].parts.uW
            //}
        }
        const colonyResources = calcRoomResources(colony, hW, pC, uW);
        //console.log("pp calcResources colony",colony,JSON.stringify(colonyResources));
        resources.hW += colonyResources.hW;
        resources.pC +=  colonyResources.pC;
        resources.wW +=  colonyResources.wW;
        resources.uW +=  colonyResources.uW
    }
    //console.log("pp calcResources", JSON.stringify(resources));
    return resources
};

calcRoomResources = function (roomName, hW, pC, uW) {
    console.log("calcRoomResources roomName", roomName, "hW", hW, "pC", pC, "uW", uW);
    const room = Game.rooms[roomName];
    const buildTicks = economy.constructionRepairLeft(room);
    const ratioHtoW = budget.workersRoomRationHtoW(room, false);
    let workerWs = 0;
    let porterCs = pC;
    let upgradeWs = uW;
    if (buildTicks > 0) {
        porterCs = 0;
        upgradeWs = 0;
        workerWs = ratioHtoW * hW;
        //console.log("pp calcRoomResources workerWs",workerWs,"ratioHtoW",ratioHtoW,"hW",ratioHtoW)
    }
    //upgradeWs =  uW * porterCs / pC;
    //console.log("calcRoomResources buildTicks",buildTicks,"ratioHtoW",ratioHtoW,"workerWs",workerWs);
    //console.log("calcRoomResources ratioWtoP",ratioWtoP, "porterCs", porterCs);
    return { "hW": hW, "pC" : porterCs, "wW" : workerWs,  "uW": upgradeWs };
};

Policy.prototype.budget = function() {
    const budget = budget.porterRoom(Game.rooms[this.home]);
    budget.parts = this.m.resources.hW*11/5;
    budget.parts += this.m.resources.pC * 3;
    budget.parts += this.m.resources.wW * 3;
    budget.parts += this.m.resources.uW * 2;
    return budget;
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;



















