/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
//const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const economy = require("economy");
const budget = require("budget");
const race = require("race");
const flag = require("flag");
const race_harvester = require("race_harvester");
//const memory = require("memory");
const FlagRoom = require("flag_room");

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
        if (room.controller.level <= 4) {
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
    console.log("pp spawns energy",room.energyAvailable,"capacity",room.energyCapacityAvailable);
    console.log("minHarvesters", resources.minHarvesters, "maxHarvesters", resources.maxHarvesters, "minReserves", resources.minReservers);
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

    const canBuildHarvesters =  (wHarvester < resources.hW || harvesters < resources.minHarvesters) && harvesters <= resources.maxHarvesters;
    const canBuildWorkers = cWorker < resources.wW;
    const canBuildPorters = cPorter < resources.pC - 0.1;
    const canBuildUpgrader = wUpgrader < resources.uW - 0.2;
    const canBuildReserver = rReserver < resources.cR - 0.2;

    //console.log("pp spawns canBuildHarvesters", canBuildHarvesters,"harvesters", harvesters, "maxh", resources.maxHarvesters)
    if (canBuildHarvesters
        && (!canBuildWorkers || wHarvester <= cWorker
        && (!canBuildPorters || wHarvester <= cPorter))) {
        //console.log("pp spawns race.getCost",race.getCost(gc.RACE_HARVESTER, room.energyCapacityAvailable),
        //    "energyCapacityAvailable",room.energyCapacityAvailable,"energy",room.energyCapacityAvailable);
        if (race.getCost(gc.RACE_HARVESTER, room.energyCapacityAvailable) <= room.energyCapacityAvailable) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_HARVESTER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
        return;
    }

    if (canBuildWorkers) {
        if (race.getCost(gc.RACE_WORKER, room.energyCapacityAvailable) <= room.energyAvailable) {
             policy.sendOrderToQueue(
                room,
                gc.RACE_WORKER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
        return;
    }

    if (canBuildPorters) {
        if (race.getCost(gc.RACE_PORTER, room.energyCapacityAvailable) <= room.energyAvailable) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_PORTER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
        return
    }

    if (canBuildReserver) {
        if (race.getCost(gc.RACE_RESERVER, room.energyCapacityAvailable) <= room.energyAvailable) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_RESERVER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
        return
    }

    if (canBuildUpgrader) {
        if (race.getCost(gc.RACE_UPGRADER, room.energyCapacityAvailable) <= room.energyAvailable) {
            policy.sendOrderToQueue(
                room,
                gc.RACE_UPGRADER,
                room.energyCapacityAvailable,
                this.parentId,
                gc.SPAWN_PRIORITY_LOCAL
            );
        }
    }
};

PolicyPorters.prototype.portersCsRoom= function(useRoad) {
    useRoad = !!useRoad;
    //console.log(!!useRoad,"|",useRoad,"portersCsRoom",this.m.portersCsRoom,this.m.portersCsRoom[useRoad], "&&",this.m.portersCsRoom  && this.m.portersCsRoom[useRoad])
    if (this.m.portersCsRoom  && this.m.portersCsRoom[useRoad]) {
        //console.log(!!useRoad,"|",useRoad,"pp portersCsRoom exists");
        return this.m.portersCsRoom[useRoad]
    } else {
        //console.log(useRoad,"pp portersCsRoom does not exist before", JSON.stringify(this.m.portersCsRoom));
        this.m.portersCsRoom = {};
        this.m.portersCsRoom[true] = budget.portersCsRoom(Game.rooms[this.home], true);
        this.m.portersCsRoom[false] = budget.portersCsRoom(Game.rooms[this.home], false);
        //console.log(useRoad,"pp portersCsRoom after", JSON.stringify(this.m.portersCsRoom));
    }
};

PolicyPorters.prototype.harvesterWsRoom= function(useRoad) {
    useRoad = !!useRoad;
    //console.log(!!useRoad,"|",useRoad,"portersCsRoom",this.m.harvesterWsRoom,this.m.harvesterWsRoom[useRoad], "&&",this.m.harvesterWsRoom  && this.m.harvesterWsRoom[useRoad])
    if (this.m.harvesterWsRoom && this.m.harvesterWsRoom[useRoad]) {
        return this.m.harvesterWsRoom[useRoad]
    } else {
        //console.log("pp harvesterWsRoom does not exist before", JSON.stringify(this.m.harvesterWsRoom));
        this.m.harvesterWsRoom = {};
        this.m.harvesterWsRoom[true] = budget.harvesterWsRoom(Game.rooms[this.home], true);
        this.m.harvesterWsRoom[false] = budget.harvesterWsRoom(Game.rooms[this.home], false);
        //console.log("pp harvesterWsRoom does not exist after", JSON.stringify(this.m.harvesterWsRoom));
    }
};

PolicyPorters.prototype.upgradersWsRoom= function(useRoad) {
    useRoad = !!useRoad;
    //console.log(!!useRoad,"|",useRoad,"portersCsRoom",this.m.upgradersWsRoom,this.m.upgradersWsRoom[useRoad], "&&",this.m.upgradersWsRoom  && this.m.upgradersWsRoom[useRoad])
    if (this.m.upgradersWsRoom && this.m.upgradersWsRoom[useRoad]) {
        return this.m.upgradersWsRoom[useRoad]
    } else {
        //console.log("pp upgradersWsRoomRoom does not exist before", JSON.stringify(this.m.upgradersWsRoom));
        const room = Game.rooms[this.home];
        this.m.upgradersWsRoom = {};
        this.m.upgradersWsRoom[true] = budget.upgradersWsRoom(room, room.energyCapacityAvailable, true);
        this.m.upgradersWsRoom[false] = budget.upgradersWsRoom(room, room.energyCapacityAvailable, false)
        //console.log("pp upgradersWsRoomRoom does not exist after", JSON.stringify(this.m.upgradersWsRoom));
    }
};

PolicyPorters.prototype.calcResources = function () {
    let resources = { hW :0, pC:0, wW:0, uW:0, cR:0 };
    let minHarvesters = 0;
    let maxHarvesters = 0;
    this.m.curProduction = {};
    const governor = policy.getGouvernerPolicy(this.home);
    const colonies = governor.getColonies();
    for (let colonyObj of colonies) {
        let colonyResources;
        const fRoom = new FlagRoom(colonyObj.name);
        const sources = fRoom.getSources();
        for (let id in sources ) {
            minHarvesters++;
            maxHarvesters += fRoom.accessPoints(id);
        }
        if (colonyObj === this.home|| colonyObj.name === this.home) {
            const homeRoom = Game.rooms[this.home];
            const ec = homeRoom.energyCapacityAvailable;
            const sourceEnergyLT = 30000;
            if (ec <= gc.MAX_EC_4WORK_HARVESTER) {
                const hWperBody = race_harvester.bodyCounts(ec)["work"];
                let maxWs = 0;
                for (let source of homeRoom.find(FIND_SOURCES)) {
                    maxWs += Math.min(5, fRoom.accessPoints(source.id)*hWperBody);
                }
                const budgetWs = this.harvesterWsRoom(homeRoom, false);
                const ratio = maxWs/budgetWs;
                colonyResources = this.updateRoomResources(
                    this.home,
                    maxWs,
                    ratio * this.portersCsRoom(homeRoom, false),
                    ratio * this.upgradersWsRoom(homeRoom, sourceEnergyLT)
                );
            } else {
                colonyResources = this.updateRoomResources(
                    this.home,
                    this.harvesterWsRoom(homeRoom, false),
                    this.portersCsRoom(homeRoom, false),
                    this.upgradersWsRoom(homeRoom, sourceEnergyLT)
                );
            }
            colonyResources["cR"] = 0;
            this.m.localResoures = Object.assign({}, colonyResources);
        } else {
            const values = fRoom.value(
                this.home,
                !!governor.m.ACTIVITY_COLONY_ROADS,
                !!governor.m.ACTIVITY_RESERVED_COLONIES,
                !!governor.m.ACTIVITY_FLEXI_HARVESTERS,
            );
            colonyResources = this.updateRoomResources(
                colonyObj.name, values.parts.hW, values.parts.pC, values.parts.uW
            );
            colonyResources["cR"] = values.parts["cR"];
        }

        this.m.curProduction[colonyObj.name] = Object.assign({}, colonyResources);
        resources.hW += colonyResources.hW;
        resources.pC +=  colonyResources.pC;
        resources.wW +=  colonyResources.wW;
        resources.uW +=  colonyResources.uW;
        resources.cR += colonyResources.cR
    }
    //console.log("pp minHarvesters1", minHarvesters,"maxHarvesters",maxHarvesters);
    resources.minHarvesters = minHarvesters;
    resources.maxHarvesters = maxHarvesters;
    resources.minReservers = this.m[gc.ACTIVITY_RESERVED_COLONIES] ? colonies.length : 0;
    return resources
};

PolicyPorters.prototype.updateRoomResources = function (roomName, hW, pC, uW) {
    //console.log("updateRoomResources roomName", roomName, "hW", hW, "pC", pC, "uW", uW);
    const room = Game.rooms[roomName];
    if (!room) { // todo cache updateRoomResources somehow so can return that if no sight on room
        return { "hW": hW, "pC" : pC, "wW" : 0,  "uW": uW };
    }
    let buildTicks, ratioHtoW;

    buildTicks = economy.constructionRepairLeft(room);
    ratioHtoW = budget.workersRoomRationHtoW(room, Game.rooms[this.home], false);
    let workerWs = 0;
    let porterCs = pC;
    let upgradeWs = uW;
    if (buildTicks > 0) {
        porterCs = 0;
        upgradeWs = 0;
        workerWs = ratioHtoW * hW;
    }
    return { "hW": hW, "pC" : porterCs, "wW" : workerWs,  "uW": upgradeWs };
};

PolicyPorters.prototype.localBudget = function() {
    const room = Game.rooms[this.home];
    const spawnCapacity = Game.rooms[this.home].find(FIND_MY_SPAWNS).length * CREEP_LIFE_TIME / CREEP_SPAWN_TIME;
    if (!this.m.localResoures) {
        return {
            "name" : this.home,
            "spawnPartsLT" : spawnCapacity,
        };
    }

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

    const ecSources = Game.rooms[this.home].find(FIND_SOURCES).length * SOURCE_ENERGY_CAPACITY;
    const profit = ecSources * gc.SORCE_REGEN_LT - budget.convertPartsToEnergy(
        this.m.localResoures.hW,
        this.m.localResoures.pC,
        this.m.localResoures.uW,
        this.m.localResoures.wW
    );
    return {
        "name" : this.home,
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



















