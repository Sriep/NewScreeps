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
const memory = require("memory");

function PolicyPorters  (id, data) {
    this.id = id;
    this.type = gc.POLICY_PORTERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

PolicyPorters.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    this.m.curProduction = {};
    return true;
};

PolicyPorters.prototype.enact = function () {
    //console.log("POLICY_PORTERS budget", JSON.stringify( budget.porterRoom(Game.rooms[this.home])));
    //console.log("POLICY_PORTERS resources", JSON.stringify(this.m.resources));
    const room = Game.rooms[this.home];
    ///if (!this.m.resources || (Game.time + this.id) % gc.CALC_ROOM_RESOURCES_RATE !== 0 ) {
        if (room.controller.level <= 3) {
            this.m.resources = this.calcResources(gc.ROOM_NEUTRAL, gc.ROOM_NEUTRAL_ROADS);
        } else {
            this.m.resources = this.calcResources(gc.ROOM_RESERVED, gc.ROOM_RESERVED_ROADS);
        }
    //}
    this.spawns(room, this.m.resources);
    console.log("POLICY_PORTERS production vector", JSON.stringify(this.m.curProduction))
};

PolicyPorters.prototype.spawns = function (room, resources) {
    console.log("pp spawns resources", JSON.stringify(resources));

    const harvesters = policy.getCreeps(this.parentId, gc.RACE_HARVESTER).length;
    const workers = policy.getCreeps(this.parentId, gc.RACE_WORKER).length;
    const porters = policy.getCreeps(this.parentId, gc.RACE_PORTER).length;
    const upgraders = policy.getCreeps(this.parentId, gc.RACE_UPGRADER).length;
    const reservers = policy.getCreeps(this.parentId, gc.RACE_RESERVER).length;
    console.log("pp spawns harvesters",harvesters,"workers",workers,"porters",porters,"upgraders",upgraders);

    const wHarvester = race.creepPartsAlive(this.parentId, gc.RACE_HARVESTER, WORK);
    const cWorker = race.creepPartsAlive(this.parentId, gc.RACE_WORKER, CARRY);
    const cPorter = race.creepPartsAlive(this.parentId, gc.RACE_PORTER, CARRY);
    const wUpgrader = race.creepPartsAlive(this.parentId, gc.RACE_UPGRADER, WORK);
    const rReserver = race.creepPartsAlive(this.parentId, gc.RACE_RESERVER, CLAIM);
    console.log("pp spawns harvesters",harvesters,"workers",workers,"porters",porters,
        "reservers",reservers,"pp spawns wHarvester",wHarvester,"cWorker",cWorker,
        "cPorter",cPorter,"rReserver",rReserver);

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
    const canBuildUpgrader = wUpgrader < resources.uW - 0.2;
    const canBuildReserver = rReserver < resources.rC - 0.2;

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

    if (canBuildReserver) {
        policy.sendOrderToQueue(
            room,
            gc.RACE_RESERVER,
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

PolicyPorters.prototype.calcResources = function (roomType1, roomType2) {
    let resources;
    this.m.curProduction = {};
    const homeRoom = Game.rooms[this.home];
    //console.log("this.home", this.home);
    const ec = homeRoom.energyCapacityAvailable;
    const sourceEnergyLT = 30000;
    if (ec <= gc.MAX_EC_4WORK_HARVESTER) {
        //console.log("calcResources ec",ec,"race_harvester.bodyCounts(ec)",JSON.stringify(race_harvester.bodyCounts(ec)));
        const hWperBody = race_harvester.bodyCounts(ec)["work"];
        let maxWs = 0;
        for (let source of homeRoom.find(FIND_SOURCES)) {
            //console.log("flag.getRoomFlag(this.home)",JSON.stringify(flag.getRoomFlag(this.home)))
            //console.log("flag.getRoomFlag(this.home).memory",JSON.stringify(flag.getRoomFlag(this.home).memory))
            const ap = flag.getRoomFlag(this.home).memory.sources[source.id].ap;
            maxWs += Math.min(5, ap*hWperBody);
        }
        const budgetWs = budget.harvesterWsRoom(homeRoom, homeRoom, false);
        const ratio = maxWs/budgetWs;
        resources = this.updateRoomResources(
            this.home,
            maxWs,
            ratio * budget.portersCsRoom(homeRoom, homeRoom, false),
            ratio * budget.upgradersWsRoom(homeRoom, sourceEnergyLT)
        );
     } else {
        resources = this.updateRoomResources(
            this.home,
            budget.harvesterWsRoom(homeRoom, homeRoom, false),
            budget.portersCsRoom(homeRoom, homeRoom, false),
            budget.upgradersWsRoom(homeRoom, sourceEnergyLT)
        );
    }
    //console.log("POLICY_PORTERS production vector1", JSON.stringify(this.m.curProduction))
    this.m.curProduction[this.home] = Object.assign({}, resources);
    //console.log("POLICY_PORTERS production vector2", JSON.stringify(this.m.curProduction))
    this.m.localResoures = Object.assign({}, resources);

    const governor = policy.getGouvernerPolicy(this.home);
    const colonies = governor.getColonies();
    for (let colonyObj of colonies) {
        if (colonyObj === this.home|| colonyObj.name === this.home) {
            continue;
        }
        const valuesObj = memory.values(colonyObj.name, this.home);
        let values;
        if(valuesObj[roomType1].profit > valuesObj[roomType2].profit) {
            values = valuesObj[roomType1];
        } else {
            values = valuesObj[roomType2];
        }
        //console.log("pp this.updateRoomResources values", JSON.stringify(values));
        let hW=0, pC=0, uW=0;
        for (let id in values["sources"]) {
            //if (values["sources"][id].netEnergy > gc.COLONY_PROFIT_MARGIN) {
                hW += values["sources"][id].parts.hW;
                pC += values["sources"][id].parts.pC;
                uW += values["sources"][id].parts.uW
            //}
        }
        const colonyResources = this.updateRoomResources(colonyObj.name, hW, pC, uW);
        this.m.curProduction[colonyObj.name] = Object.assign({}, colonyResources);
        //console.log("pp this.updateRoomResources colony",colonyObj.name,JSON.stringify(colonyResources));
        resources.hW += colonyResources.hW;
        resources.pC +=  colonyResources.pC;
        resources.wW +=  colonyResources.wW;
        resources.uW +=  colonyResources.uW;
        resources.rC += values["sources"]["rC"];
        //console.log(colonyObj.name,"POLICY_PORTERS production vector", JSON.stringify(this.m.curProduction))
    }
    //console.log("pp this.updateRoomResources", JSON.stringify(resources));
    return resources
};

PolicyPorters.prototype.updateRoomResources = function (roomName, hW, pC, uW) {
    //console.log("updateRoomResources roomName", roomName, "hW", hW, "pC", pC, "uW", uW);
    const room = Game.rooms[roomName];
    if (!room) { // todo cache updateRoomResources somehow so can return that if no sight on room
        return { "hW": hW, "pC" : pC, "wW" : 0,  "uW": uW };
    }
    //console.log("updateRoomResources room", room.name, roomName)
    let buildTicks, ratioHtoW;
    //if (room) {
        buildTicks = economy.constructionRepairLeft(room);
        ratioHtoW = budget.workersRoomRationHtoW(room, Game.rooms[this.home], false);
    //} else {
    //    buildTicks = 0;
    //    ratioHtoW = 1.1;
    //}
    let workerWs = 0;
    let porterCs = pC;
    let upgradeWs = uW;
    if (buildTicks > 0) {
        porterCs = 0;
        upgradeWs = 0;
        workerWs = ratioHtoW * hW;
        //console.log("pp updateRoomResources workerWs",workerWs,"ratioHtoW",ratioHtoW,"hW",ratioHtoW)
    }
    //upgradeWs =  uW * porterCs / pC;
    //console.log("updateRoomResources buildTicks",buildTicks,"ratioHtoW",ratioHtoW,"workerWs",workerWs);
    //console.log("updateRoomResources ratioWtoP",ratioWtoP, "porterCs", porterCs);
    return { "hW": hW, "pC" : porterCs, "wW" : workerWs,  "uW": upgradeWs };
};

PolicyPorters.prototype.localBudget = function() {
    const room = Game.rooms[this.home];
    //console.log("pp localBudget localResources", JSON.stringify(this.m.localResoures));
    const hbc = race.getBodyCounts(gc.RACE_HARVESTER, room.energyCapacityAvailable);
    const hPartCount = hbc[WORK] + hbc[MOVE] + hbc[CARRY];
    let parts = Math.ceil((this.m.localResoures.hW*11/5)/hPartCount) * hPartCount;

    const pbc = race.getBodyCounts(gc.RACE_PORTER, room.energyCapacityAvailable);
    const pPartCount = pbc[WORK] + pbc[MOVE] + pbc[CARRY];
    parts += Math.ceil((this.m.localResoures.pC*3)/pPartCount) * pPartCount;

    const wbc = race.getBodyCounts(gc.RACE_WORKER, room.energyCapacityAvailable);
    const wPartCount = wbc[WORK] + wbc[MOVE] + wbc[CARRY];
    parts += Math.ceil((this.m.localResoures.wW*3)/wPartCount) * wPartCount;

    const ubc = race.getBodyCounts(gc.RACE_UPGRADER, room.energyCapacityAvailable);
    const uPartCount = ubc[WORK] + ubc[MOVE] + ubc[CARRY];
    parts += Math.ceil((this.m.localResoures.uW*2)/uPartCount) * uPartCount;

    parts += 4; // scouts.
    const spawnCapacity = Game.rooms[this.home].find(FIND_MY_SPAWNS).length * CREEP_LIFE_TIME / CREEP_SPAWN_TIME;

    const ecSources = Game.rooms[this.home].find(FIND_SOURCES).length * SOURCE_ENERGY_CAPACITY;
    const profit = ecSources * gc.SORCE_REGEN_LT - budget.convertPartsToEnergy(
        this.m.localResoures.hW,
        this.m.localResoures.pC,
        this.m.localResoures.uW,
        this.m.localResoures.wW
    );

    //console.log("POLICY_PORTERS localBudget parts", parts, "rtv", JSON.stringify({
    //    "profit" : profit,
    //    "parts" : parts,
    //    "profitpart" : profit/parts,
    //    "spawnPartsLT" : spawnCapacity,
    //}));
    return {
        "profit" : profit,
        "parts" : parts,
        "profitpart" : profit/parts,
        "spawnPartsLT" : spawnCapacity,
    };
};

PolicyPorters.prototype.draftReplacment = function() {
    return this
};

module.exports = PolicyPorters;



















