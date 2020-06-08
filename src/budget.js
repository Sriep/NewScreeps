/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const cache = require("./cache");
const gc = require("./gc");
const gf = require("./gf");
const race = require("./race");
//const raceHarvester = require("./race_harvester");

const budget = {

    portersCsRoom: function (room, useRoad) {
        console.log("portersCsRoom");
        const sources = room.find(C.FIND_SOURCES);
        let csRoom = 0;
        for (let i in sources) {
            const initial = cache.distanceSourceSpawn(sources[i], room, useRoad);
            const repeat = cache.distanceSourceController(sources[i], room, useRoad);
            csRoom += this.porterCsSource(sources[i].energyCapacity, initial, repeat);
        }
        return csRoom;
    },

    porterCsSource: function (ec, initial, repeat) {
        const workLifetime = C.CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / (2*repeat);
        const energyPortedPerCarryPart = tripsPerLife * C.CARRY_CAPACITY;
        const maxEnergy = ec * (C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME);
        return maxEnergy / energyPortedPerCarryPart;
    },

    workerRoom: function(room, numWorkers) {
        console.log("workerRoom");
        const workerCost = numWorkers * race.getCost(gc.RACE_WORKER, room.energyCapacityAvailable);
        const wsPerWorker = race.getBodyCounts(gc.RACE_WORKER, room.energyCapacityAvailable);
        const sources = room.find(C.FIND_SOURCES);
        let dAvSourceController = 0;
        let dAvSourceSpawn = 0;
        for (let source of sources) {
            dAvSourceController += cache.distanceSourceController(source, room, false);
            dAvSourceSpawn += cache.distanceSourceSpawn(source, room, false);
        }
        dAvSourceController = dAvSourceController / sources.length;
        const energyTrip = C.CARRY_CAPACITY/C.UPGRADE_CONTROLLER_POWER + C.UPGRADE_CONTROLLER_POWER/C.HARVEST_POWER;
        const tripsLt = (C.CREEP_LIFE_TIME - dAvSourceSpawn)/(2*dAvSourceController);
        const energyWLt = energyTrip * tripsLt;

        return wsPerWorker * numWorkers * energyWLt - workerCost;
    },

    harvesterRoom: function (room) {
        return this.porterRoom(room)
    },

    porterRoom: function (room) {
        const budgetHarvesterWs = budget.harvesterWsRoom(room, false);
        const budgetUpgradersWs =  budget.upgradersWsRoom(room, room.energyCapacityAvailable, false);
        const portersCsRoom = budget.portersCsRoom(room, false);
        const harvesterCount = Math.ceil(budgetHarvesterWs*gc.WWM_COST/room.energyCapacityAvailable);
        const upgradersCount = Math.ceil(budgetUpgradersWs*gc.WWM_COST/room.energyCapacityAvailable);
        const harvestersCost = budgetHarvesterWs*gc.WWM_COST + harvesterCount*C.BODYPART_COST[C.CARRY];
        const upgradersCost = budgetUpgradersWs*gc.WWM_COST + upgradersCount*C.BODYPART_COST[C.CARRY];
        const portersCost =  portersCsRoom*gc.CCM_COST;
        const creepUpkeep = harvestersCost + upgradersCost + portersCost;

        const netEnergy = 5*2*C.SOURCE_ENERGY_CAPACITY - creepUpkeep;
        const parts = budgetHarvesterWs*3+ budgetUpgradersWs*3 + portersCsRoom*3 + harvesterCount + upgradersCount;
        return { "profit" : netEnergy, "parts" :  parts };
    },

    spawnPartsLT: function (room) {
        const energyCapacity = room.energyCapacity(room);
        return {
            energyLT: energyCapacity * C.CREEP_LIFE_TIME,
            creepPartsLT: Math.floor(C.CREEP_LIFE_TIME / C.CREEP_SPAWN_TIME)
        };
    },

    valueNeutralRoom: function (roomName, home) {
        const room = Game.rooms[roomName];
        home = Game.rooms[home];
        if (!room) {
            return {};
        }
        if (!room.controller) {
            return { "no_controller" : true }
        }

        const sources = room.find(C.FIND_SOURCES);
        const spawns = home.find(C.FIND_MY_SPAWNS);
        const values = {};
        const blank = {"setup": 0, "profit": 0, "parts" : 0, "startUpCost":0, "rC": 0};
        values[gc.ROOM_NEUTRAL] = Object.assign({}, blank);
        values[gc.ROOM_NEUTRAL]["sources"] = {};
        values[gc.ROOM_NEUTRAL_ROADS] = Object.assign({}, blank);
        values[gc.ROOM_NEUTRAL_ROADS]["sources"] = {};
        values[gc.ROOM_RESERVED] = Object.assign({}, blank);
        values[gc.ROOM_RESERVED]["sources"] = {};
        values[gc.ROOM_RESERVED_ROADS] = Object.assign({}, blank);
        values[gc.ROOM_RESERVED_ROADS]["sources"] = {};
        values[gc.ROOM_OWNED] = Object.assign({}, blank);
        values[gc.ROOM_OWNED]["sources"] = {};
        values[gc.ROOM_OWNED_ROADS] = Object.assign({}, blank);
        values[gc.ROOM_OWNED_ROADS]["sources"] = {};
        //values[gc.ROOM_RESERVED]["rC"] = 0;
        //values[gc.ROOM_RESERVED_ROADS]["rC"] = 0;
        let sourcePathsRoad = [];
        let sourcePathNoRoad = [];
        let controllerPathRoad = [];
        let controllerPathNoRoad = [];
        let homeDistance = 0;

        if (sources.length === 0) {
            values["no source"] = true;
            return values;
        }
        for (let source of sources) {
            sourcePathNoRoad.push(cache.path(source, spawns, roomName+" spawn1", 1, false).cost);
            sourcePathsRoad.push(cache.path(source, spawns, roomName+ "spawn2", 1, true).cost);
            controllerPathNoRoad.push(cache.path(source, [home.controller], roomName+" spawn3", 1, false).cost);
            controllerPathRoad.push(cache.path(source, [home.controller], roomName+" spawn4", 1, true).cost);
            homeDistance += cache.path(source, [room.controller], roomName+" spawn5", 1, false).cost;
        }
        const disControllerSpawn = cache.path(room.controller, spawns, roomName+" spawn6", 1, false).cost;
        homeDistance = homeDistance/sources.length;

        for (let i in sources) {
            const nnr = this.valueSourceNoRoad(sourcePathNoRoad[i], controllerPathNoRoad[i], gc.SORCE_REGEN_LT*C.SOURCE_ENERGY_NEUTRAL_CAPACITY);
            //console.log("budget nnr", JSON.stringify(nnr));
            values[gc.ROOM_NEUTRAL]["sources"][sources[i].id] = nnr;
            values[gc.ROOM_NEUTRAL]["parts"] += nnr.parts.hW + nnr.parts.pC +nnr.parts.uW;
            values[gc.ROOM_NEUTRAL]["setup"] += nnr.startUpCost;
            values[gc.ROOM_NEUTRAL]["profit"] += nnr.netEnergy;
            values[gc.ROOM_NEUTRAL]["startUpCost"] += nnr.startUpCost;

            const nr = this.valueSourceRoad(sourcePathsRoad[i], controllerPathRoad[i], gc.SORCE_REGEN_LT*C.SOURCE_ENERGY_NEUTRAL_CAPACITY);
            values[gc.ROOM_NEUTRAL_ROADS]["sources"][sources[i].id] = nr;
            values[gc.ROOM_NEUTRAL_ROADS]["parts"] += nr.parts.hW + nr.parts.pC +nr.parts.uW;
            values[gc.ROOM_NEUTRAL_ROADS]["setup"] += nr.startUpCost;
            values[gc.ROOM_NEUTRAL_ROADS]["profit"] += nr.netEnergy;
            values[gc.ROOM_NEUTRAL_ROADS]["startUpCost"] += nr.startUpCost;

            const rnr = this.valueSourceNoRoad(sourcePathNoRoad[i], controllerPathNoRoad[i], gc.SORCE_REGEN_LT*C.SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED]["sources"][sources[i].id] = rnr;
            values[gc.ROOM_RESERVED]["parts"] += rnr.parts.hW + rnr.parts.pC +rnr.parts.uW;
            values[gc.ROOM_RESERVED]["setup"] += rnr.startUpCost;
            values[gc.ROOM_RESERVED]["profit"] += rnr.netEnergy;
            values[gc.ROOM_RESERVED]["startUpCost"] += rnr.startUpCost;

            const rr = this.valueSourceNoRoad(sourcePathsRoad[i], controllerPathRoad[i], gc.SORCE_REGEN_LT*C.SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED_ROADS]["sources"][sources[i].id] = rr;
            values[gc.ROOM_RESERVED_ROADS]["parts"] += rr.parts.hW + rr.parts.pC +rr.parts.uW;
            values[gc.ROOM_RESERVED_ROADS]["setup"] += rr.startUpCost;
            values[gc.ROOM_RESERVED_ROADS]["profit"] += rr.netEnergy;
            values[gc.ROOM_RESERVED_ROADS]["startUpCost"] += rr.startUpCost;

            const onr = this.valueSourceNoRoad(homeDistance, homeDistance, gc.SORCE_REGEN_LT*C.SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_OWNED]["sources"][sources[i].id] = onr;
            values[gc.ROOM_OWNED]["parts"] += onr.parts.hW + onr.parts.pC +onr.parts.uW;
            values[gc.ROOM_OWNED]["setup"] += onr.startUpCost;
            values[gc.ROOM_OWNED]["profit"] += onr.netEnergy;

            const or = this.valueSourceNoRoad(homeDistance, homeDistance, gc.SORCE_REGEN_LT*C.SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_OWNED_ROADS]["sources"][sources[i].id] = or;
            values[gc.ROOM_OWNED_ROADS]["parts"] += or.parts.hW + or.parts.pC +or.parts.uW;
            values[gc.ROOM_OWNED_ROADS]["setup"] += or.startUpCost;
            values[gc.ROOM_OWNED_ROADS]["profit"] += or.netEnergy;
        }

        const rC = this.reserverParts(room, spawns, false, disControllerSpawn);
        values[gc.ROOM_RESERVED]["rC"] += rC;
        values[gc.ROOM_RESERVED_ROADS]["rC"] += rC;
        values[gc.ROOM_RESERVED]["profit"] -= 850*rC;
        values[gc.ROOM_RESERVED_ROADS]["profit"] -= 650*rC;
        values[gc.ROOM_RESERVED]["parts"] += 5*rC;
        values[gc.ROOM_RESERVED_ROADS]["parts"] += 5*rC;

        values[gc.ROOM_OWNED]["profit"] += 600; // reduction in container repair
        values[gc.ROOM_OWNED_ROADS]["profit"] += 600; // reduction in container repair
        return values;
    },

    valueSourceRoad: function (pathSpawn, pathController, energy, swamps) {
        if (!swamps) {
            swamps = 0;
        }

        const startUpCost = (pathController - swamps)*C.CONSTRUCTION_COST[C.STRUCTURE_ROAD]
            + swamps *C.CONSTRUCTION_COST[C.STRUCTURE_ROAD]* C.CONSTRUCTION_COST_ROAD_SWAMP_RATIO
            + C.CONSTRUCTION_COST[C.STRUCTURE_CONTAINER];
        const runningCostRepair = (pathController - swamps)*1.5 + swamps*7.5 + 750;

        const hWs = this.harvesterWsSource(energy/(C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME), pathSpawn);
        const pCs = this.porterCsSource(energy/(C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME), pathSpawn, pathController);
        const energy1 = energy - this.convertPartsToEnergy(hWs, pCs, hWs,0) - runningCostRepair;
        const uWs1 = this.upgraderWsFromDistance(20, energy1); // guess 20
        const energy2 = energy -this.convertPartsToEnergy(hWs, pCs, uWs1,0) - runningCostRepair;
        const uWs2 = this.upgraderWsFromDistance(20, energy2);
        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs2,0);

        return {
            "parts": { "hW": hWs, "pC": pCs, "uW": uWs2 },
            "startUpCost": startUpCost,
            "runningCostRepair": runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": energy - runningCostRepair - creepCosts,
        };
    },

    valueSourceNoRoad: function (pathSpawn, pathController, energy) {
        //console.log("pathSpawn",pathSpawn.cost,"pathController",pathController.cost,"energy",energy);
        const startUpCost = C.CONSTRUCTION_COST[C.STRUCTURE_CONTAINER];
        const runningCostRepair = C.CREEP_LIFE_TIME*C.CONTAINER_DECAY/
                                      (C.CONTAINER_DECAY_TIME*C.REPAIR_POWER);

        const hWs = this.harvesterWsSource(energy/(C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME), pathSpawn);
        const pCs = this.porterCsSource(energy/(C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME), pathSpawn, pathController);
        const energy1 = energy - this.convertPartsToEnergy(hWs, pCs, hWs,0);
        const uWs1 = this.upgraderWsFromDistance(20, energy1); // guess 20
        const energy2 = energy - this.convertPartsToEnergy(hWs, pCs, uWs1,0);
        const uWs2 = this.upgraderWsFromDistance(20, energy2);
        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs2,0);

        return {
            "parts": { "hW": hWs, "pC": pCs, "uW": uWs2 },
            "startUpCost": startUpCost,
            "runningCostRepair": runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": energy - runningCostRepair - creepCosts,
        };
    },

    workersRoomRationHtoW : function (room, spawnRoom, useRoad) {
        //console.log("b workersRoomRationHtoW room", room.name,"spawnRoom", spawnRoom.name, "useroad", useRoad);
        const sources = room.find(C.FIND_SOURCES);
        if (sources.length === 0) {
            return 1;
        }
        let avDistance = 0;
        let count = 0;
        for (let source of sources) {
            // todo expensive, maybe better caching
            const sites = room.find(C.FIND_MY_CONSTRUCTION_SITES, {
                filter: obj => { return obj.structureType !== C.STRUCTURE_WALL
                    && obj.structureType !== C.STRUCTURE_RAMPART;
                }
            });
            for (let site of sites) {
                avDistance += cache.distance(
                    site,
                    [source],
                    site.id.toString() + source.id.toString(),
                    1,
                    useRoad,
                    true,
                    false,
                );
                count++;
            }
        }
        if (count === 0) {
            return 1;
        }

        //avDistance = avDistance/sources.length;
        avDistance = avDistance/count;
        const workLt = C.CREEP_LIFE_TIME - avDistance;
        const tripTime = C.CARRY_CAPACITY/C.BUILD_POWER + 2*avDistance;
        const tripsLt = workLt/tripTime;
        const energyPerWLt = tripsLt * C.CARRY_CAPACITY;
        const energyPerHlt = workLt * 2;
        //console.log("room",room.name,"avDistance",avDistance,"sources", sources.length, "count", count);
        //console.log("workersRoomRationHtoW energyPerWLt",energyPerWLt,"tripsLt",tripsLt,"tripTime",tripTime,"workLt",workLt)
        return energyPerHlt / energyPerWLt;
    },

    convertPartsToEnergy(hWs, pCs, uWs, wWCs, cRs, roads, roomEc) { // harvester, porter, upgrader and worker sizes
        cRs = cRs ? cRs : 0;
        wWCs = wWCs ? wWCs : 0;
        uWs = uWs ? uWs : 0;
        let cost = 0;
        if (roomEc) {
            cost +=  race.getCost(gc.RACE_HARVESTER, roomEc, true);
        } else {
            cost += (hWs/5)*800;
        }
        cost += roads ? pCs*75 : pCs*100;
        cost += uWs * 125 + wWCs*200 + 800*cRs;
        return cost;
    },

    valueSource: function(
        energy,
        dSourceSpawn,
        dSourceController,
        useRoads,
        swamps,
        roomEc,
    ) {
        const hWs = this.harvesterWsSource(energy, dSourceSpawn);
        const pCs = this.porterCsSource(energy, dSourceSpawn, dSourceController);
        const uWs = this.upgraderWsEnergy(energy, 20, gc.UPGRADERS_RECURSE_LEVEL);
        const energyLT = energy * (C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME);

        let netParts = pCs  + uWs;
        if (roomEc) {
            const bc = race.getBodyCounts(gc.RACE_HARVESTER, roomEc, true);
            netParts += bc[C.WORK] + bc[C.MOVE] + bc[C.CARRY];
        } else {
            netParts += hWs;
        }

        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs,0, 0, useRoads, roomEc);
        const overheads =  this.overheads(dSourceController, useRoads, swamps);
        const netEnergy = energyLT - overheads.runningCostRepair - creepCosts;
        return {
            "parts": { "hW": hWs, "pC": pCs, "uW": uWs, "cR": 0},
            "startUpCost": overheads.startUpCost,
            "runningCostRepair": overheads.runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": netEnergy,
            "netParts": netParts,
            "profitParts" : netEnergy/netParts,
        };
    },

    addSourceValues: function(value1, value2) {
        if (!value1 || gf.isEmpty(value1)) {
            return value2;
        }
        return {
            "parts": {
                "hW": value1.parts.hW + value2.parts.hW,
                "pC": value1.parts.pC + value2.parts.pC,
                "uW": value1.parts.uW + value2.parts.uW,
            },
            "startUpCost": value1.startUpCost + value1.startUpCost,
            "runningCostRepair": value1.runningCostRepair + value2.runningCostRepair,
            "runningCostCreeps": value1.runningCostCreeps + value2.runningCostCreeps,
            "netEnergy": value1.netEnergy + value2.netEnergy,
            "netParts": value1.netParts + value2.netParts,
            "profitParts" : (value1.netEnergy + value2.netEnergy)/(value1.netParts + value2.netParts),
        };
    },

    overheads: function(dSourceController, useRoads, swamps) {
        let startUpCost, runningCostRepair;
        if (useRoads) {
            startUpCost = (dSourceController - swamps)*C.CONSTRUCTION_COST[C.STRUCTURE_ROAD]
                + swamps *C.CONSTRUCTION_COST[C.STRUCTURE_ROAD]* C.CONSTRUCTION_COST_ROAD_SWAMP_RATIO
                + C.CONSTRUCTION_COST[C.STRUCTURE_CONTAINER];
            runningCostRepair = (dSourceController - swamps)*1.5 + swamps*7.5 + 750;
        } else {
            startUpCost = C.CONSTRUCTION_COST[C.STRUCTURE_CONTAINER];
            runningCostRepair = C.CREEP_LIFE_TIME*C.CONTAINER_DECAY/
                (C.CONTAINER_DECAY_TIME*C.REPAIR_POWER);
        }
        return {startUpCost: startUpCost, runningCostRepair: runningCostRepair};
    },

    harvesterWsRoom : function (homeRoom, useRoad) {
        console.log("arvesterWsRoom");
        const sources = homeRoom.find(C.FIND_SOURCES);
        let wsRoom = 0;
        for (let i in sources) {
            const distance = cache.distanceSourceSpawn(sources[i], homeRoom, useRoad);
            wsRoom += this.harvesterWsSource(sources[i].energyCapacity, distance);
        }
        return wsRoom;
    },

    harvesterWsSource : function (ec, distance) {
        const workLifetime = C.CREEP_LIFE_TIME - distance;
        const energyCollectedPerWorkPart = workLifetime * C.HARVEST_POWER;
        const maxEnergy = ec * (C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME);
        return maxEnergy / energyCollectedPerWorkPart;
    },

    reserverParts(dControllerSpawn) {
        return C.UPGRADE_CONTROLLER_POWER * C.CREEP_LIFE_TIME / (C.CREEP_CLAIM_LIFE_TIME - dControllerSpawn);
    },

    upgradersWsRoom: function (room, energy, useRoad) {
        const distance = cache.distanceUpgraderSpawn(room, room, useRoad);
        return this.upgraderWsEnergy(energy, distance, gc.UPGRADERS_RECURSE_LEVEL)
        //return this.upgraderWsFromDistance(travel, energy);
    },

    upgraderWsFromDistance: function(distance, energy) {
        const workLifetime = C.CREEP_LIFE_TIME - distance;
        const energySentPerWorkPart = workLifetime * C.UPGRADE_CONTROLLER_POWER;
        return energy / energySentPerWorkPart;
    },

    upgraderWsEnergy: function(energy, distance, maxDepth) {
        return this.upgraderWsEnergyI(0, energy, distance, maxDepth, 0)
    },

    upgraderWsEnergyI: function(uWs, energy, distance, maxDepth, currentDepth) {
        if (currentDepth >= maxDepth) {
            return uWs;
        }
        const newUWs = this.upgraderWsFromDistance2(energy, distance);
        energy -=  this.convertPartsToEnergy(0, 0, 0,newUWs-uWs, 0);
        return this.upgraderWsEnergyI(newUWs, energy, distance, maxDepth, currentDepth+1)
    },

    upgraderWsFromDistance2: function(energy, distance) {
        const workLifetime = C.CREEP_LIFE_TIME - distance;
        const energySentPerWorkPart = workLifetime * C.UPGRADE_CONTROLLER_POWER;
        const totalEnergy = energy * (C.CREEP_LIFE_TIME / C.ENERGY_REGEN_TIME);
        return totalEnergy / energySentPerWorkPart;
    },
};

module.exports = budget;


































