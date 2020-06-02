/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */

const cache = require("cache");
const gc = require("gc");
const race = require("race");
//const gf = require("gf");

const budget = {
/*
    harvesterWsRoom: function(sourceRoom, homeRoom, useRoad) {
        return  cache.global(
            harvesterWsRoom,
            "harvesterWsRoom_" + sourceRoom.name + "_homeRoom.name",
            [sourceRoom, homeRoom, useRoad],
            false
        );
    },
*/
    portersCsRoom: function (sourceRoom, homeRoom, useRoad) {
        const sources = homeRoom.find(FIND_SOURCES);
        let csRoom = 0;
        for (let i in sources) {
            const initial = cache.distanceSourceSpawn(sources[i], homeRoom, useRoad);
            const repeat = cache.distanceSourceController(sources[i], homeRoom, useRoad);
            csRoom += this.porterCsSource(sources[i].energyCapacity, initial, repeat);
        }
        return csRoom;
    },

    // Cs need for Energh = Energy * Trips per life / (Lifetime + carry amount)
    porterCsSource: function (ec, initial, repeat) {
        const workLifetime = CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / (2*repeat);
        //console.log("porterCsSource ec",ec,"initial", initial, "repeat", repeat)
        const energyPortedPerCarryPart = tripsPerLife * CARRY_CAPACITY;
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME);
        //console.log("porterCsSource", maxEnergy, "energyPortedPerCarryPart", energyPortedPerCarryPart, "tripsPerLife", tripsPerLife);
        return maxEnergy / energyPortedPerCarryPart;
    },

    // Ws needed = Energy / ( Liftime - distance)
    upgradersWsRoom: function (room, energy, useRoad) {
        const travel = cache.distanceUpgraderSpawn(room, room, useRoad);
        return this.upgraderWsFromDistance(travel, energy);
    },

    upgraderWsFromDistance: function(distance, energy) {
        const workLifetime = CREEP_LIFE_TIME - distance;
        const energySentPerWorkPart = workLifetime * UPGRADE_CONTROLLER_POWER;
        //console.log("budget upgraderWsFromDistance",energy / energySentPerWorkPart,
        //    "distance", distance, "energy", energy,"workLifetime",workLifetime,
        //    "energySentPerWorkPart", energySentPerWorkPart)
        return energy / energySentPerWorkPart;
    },
/*
    workersRoomRationHtoW: function(room, spawnRoom, useRoad, force) {
        return  cache.global(
            workersRoomRationHtoW,
            "workersRoomRationHtoW_" + room.name,
            [room, spawnRoom, useRoad],
            force
        );
    },
*/
    workerRoom: function(room, numWorkers) {
        const workerCost = numWorkers * race.getCost(gc.RACE_WORKER, room.energyCapacityAvailable);
        const wsPerWorker = race.getBodyCounts(gc.RACE_WORKER, room.energyCapacityAvailable);
        const sources = room.find(FIND_SOURCES);
        let dAvSourceController = 0;
        let dAvSourceSpawn = 0;
        for (let source of sources) {
            dAvSourceController += cache.distanceSourceController(source, room, false);
            dAvSourceSpawn += cache.distanceSourceSpawn(source, room, false);
        }
        dAvSourceController = dAvSourceController / sources.length;
        const energyTrip = CARRY_CAPACITY/UPGRADE_CONTROLLER_POWER + UPGRADE_CONTROLLER_POWER/HARVEST_POWER;
        const tripsLt = (CREEP_LIFE_TIME - dAvSourceSpawn)/(2*dAvSourceController);
        const energyWLt = energyTrip * tripsLt;

        return wsPerWorker * numWorkers * energyWLt - workerCost;
    },

    harvesterRoom: function (room) {
        return this.porterRoom(room)
    },

    porterRoom: function (room) {
        const budgetHarvesterWs = budget.harvesterWsRoom(room, room, false);
        const budgetUpgradersWs =  budget.upgradersWsRoom(room, room.energyCapacityAvailable, false);
        const portersCsRoom = budget.portersCsRoom(room, room, false);
        const harvesterCount = Math.ceil(budgetHarvesterWs*gc.WWM_COST/room.energyCapacityAvailable);
        const upgradersCount = Math.ceil(budgetUpgradersWs*gc.WWM_COST/room.energyCapacityAvailable);
        const harvestersCost = budgetHarvesterWs*gc.WWM_COST + harvesterCount*BODYPART_COST[CARRY];
        const upgradersCost = budgetUpgradersWs*gc.WWM_COST + upgradersCount*BODYPART_COST[CARRY];
        const portersCost =  portersCsRoom*gc.CCM_COST;
        const creepUpkeep = harvestersCost + upgradersCost + portersCost;

        const netEnergy = 5*2*SOURCE_ENERGY_CAPACITY - creepUpkeep;
        const parts = budgetHarvesterWs*3+ budgetUpgradersWs*3 + portersCsRoom*3 + harvesterCount + upgradersCount;
        return { "profit" : netEnergy, "parts" :  parts };
    },

    spawnPartsLT: function (room) {
        const energyCapacity = room.energyCapacity(room);
        return {
            energyLT: energyCapacity * CREEP_LIFE_TIME,
            creepPartsLT: Math.floor(CREEP_LIFE_TIME / CREEP_SPAWN_TIME)
        };
    },

    reserverParts(neutral, spawns, useRoad, force) {
        const path = cache.path(neutral.controller, spawns, "spawn", 1, useRoad, force);
        return CREEP_LIFE_TIME / ((CREEP_CLAIM_LIFE_TIME - path.cost) * UPGRADE_CONTROLLER_POWER);
        //useRoad ? 650*Rs : 850*Rs;
    },

    valueNeutralRoom: function (roomName, home, force) {
        //console.log("valueNeutralRoom roomName", roomName, "home", home, "force",force);
        const room = Game.rooms[roomName];
        home = Game.rooms[home];
        if (!room) {
            return {};
        }
        if (!room.controller) {
            return { "no_controller" : true }
        }

        const sources = room.find(FIND_SOURCES);
        const spawns = home.find(FIND_MY_SPAWNS);
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
            sourcePathNoRoad.push(cache.path(source, spawns, "spawn", 1, false, force).cost);
            sourcePathsRoad.push(cache.path(source, spawns, "spawn", 1, true, force).cost);
            controllerPathNoRoad.push(cache.path(source, [home.controller], "spawn", 1, false, force).cost);
            controllerPathRoad.push(cache.path(source, [home.controller], "spawn", 1, true, force).cost);
            homeDistance += cache.path(source, [room.controller], "spawn", 1, false, force).cost;
        }
        homeDistance = homeDistance/sources.length;

        for (let i in sources) {
            const nnr = this.valueSourceNoRoad(sourcePathNoRoad[i], controllerPathNoRoad[i], gc.SORCE_REGEN_LT*SOURCE_ENERGY_NEUTRAL_CAPACITY);
            //console.log("budget nnr", JSON.stringify(nnr));
            values[gc.ROOM_NEUTRAL]["sources"][sources[i].id] = nnr;
            values[gc.ROOM_NEUTRAL]["parts"] += nnr.parts.hW + nnr.parts.pC +nnr.parts.uW;
            values[gc.ROOM_NEUTRAL]["setup"] += nnr.startUpCost;
            values[gc.ROOM_NEUTRAL]["profit"] += nnr.netEnergy;
            values[gc.ROOM_NEUTRAL]["startUpCost"] += nnr.startUpCost;

            const nr = this.valueSourceRoad(sourcePathsRoad[i], controllerPathRoad[i], gc.SORCE_REGEN_LT*SOURCE_ENERGY_NEUTRAL_CAPACITY);
            values[gc.ROOM_NEUTRAL_ROADS]["sources"][sources[i].id] = nr;
            values[gc.ROOM_NEUTRAL_ROADS]["parts"] += nr.parts.hW + nr.parts.pC +nr.parts.uW;
            values[gc.ROOM_NEUTRAL_ROADS]["setup"] += nr.startUpCost;
            values[gc.ROOM_NEUTRAL_ROADS]["profit"] += nr.netEnergy;
            values[gc.ROOM_NEUTRAL_ROADS]["startUpCost"] += nr.startUpCost;

            const rnr = this.valueSourceNoRoad(sourcePathNoRoad[i], controllerPathNoRoad[i], gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED]["sources"][sources[i].id] = rnr;
            values[gc.ROOM_RESERVED]["parts"] += rnr.parts.hW + rnr.parts.pC +rnr.parts.uW;
            values[gc.ROOM_RESERVED]["setup"] += rnr.startUpCost;
            values[gc.ROOM_RESERVED]["profit"] += rnr.netEnergy;
            values[gc.ROOM_RESERVED]["startUpCost"] += rnr.startUpCost;

            const rr = this.valueSourceNoRoad(sourcePathsRoad[i], controllerPathRoad[i], gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED_ROADS]["sources"][sources[i].id] = rr;
            values[gc.ROOM_RESERVED_ROADS]["parts"] += rr.parts.hW + rr.parts.pC +rr.parts.uW;
            values[gc.ROOM_RESERVED_ROADS]["setup"] += rr.startUpCost;
            values[gc.ROOM_RESERVED_ROADS]["profit"] += rr.netEnergy;
            values[gc.ROOM_RESERVED_ROADS]["startUpCost"] += rr.startUpCost;

            const onr = this.valueSourceNoRoad(homeDistance, homeDistance, gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_OWNED]["sources"][sources[i].id] = onr;
            values[gc.ROOM_OWNED]["parts"] += onr.parts.hW + onr.parts.pC +onr.parts.uW;
            values[gc.ROOM_OWNED]["setup"] += onr.startUpCost;
            values[gc.ROOM_OWNED]["profit"] += onr.netEnergy;

            const or = this.valueSourceNoRoad(homeDistance, homeDistance, gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_OWNED_ROADS]["sources"][sources[i].id] = or;
            values[gc.ROOM_OWNED_ROADS]["parts"] += or.parts.hW + or.parts.pC +or.parts.uW;
            values[gc.ROOM_OWNED_ROADS]["setup"] += or.startUpCost;
            values[gc.ROOM_OWNED_ROADS]["profit"] += or.netEnergy;
        }

        const rC = this.reserverParts(room, spawns, false, force);
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

    swamps: function(path) { // only works for non road paths.
        return (path.cost - path.path.length)/4;
    },

    valueSource: function(pathSpawn, pathController, swamps, energy, useRoad) {
        return useRoad  ?   valueSourceRoad(pathSpawn, pathController, swamps, energy)
                        :   valueSourceNoRoad(pathSpawn, pathController, swamps, energy)
    },

    valueSourceRoad: function (pathSpawn, pathController, energy, swamps) {
        if (!swamps) {
            swamps = 0;
        }

        const startUpCost = (pathController - swamps)*CONSTRUCTION_COST[STRUCTURE_ROAD]
            + swamps *CONSTRUCTION_COST[STRUCTURE_ROAD]* CONSTRUCTION_COST_ROAD_SWAMP_RATIO
            + CONSTRUCTION_COST[STRUCTURE_CONTAINER];

        //console.log("pathSpawn",pathSpawn.cost,"pathController",pathController.cost,"energy",energy)
        const runningCostRepair = (pathController - swamps)*1.5 + swamps*7.5 + 750;
        const hWs = this.harvesterWsSource(energy/(CREEP_LIFE_TIME / ENERGY_REGEN_TIME), pathSpawn);
        //console.log("hWs = harvesterWsSource", hWs)
        const pCs = this.porterCsSource(energy/(CREEP_LIFE_TIME / ENERGY_REGEN_TIME), pathSpawn, pathController);
        const energy1 = energy - this.convertPartsToEnergy(hWs, pCs, hWs,0) - runningCostRepair;
        const uWs1 = this.upgraderWsFromDistance(20, energy1); // guess 20
        const energy2 = energy -this.convertPartsToEnergy(hWs, pCs, uWs1,0) - runningCostRepair;
        const uWs2 = this.upgraderWsFromDistance(20, energy2);
        // console.log("hWs", hWs, "pCs", pCs, "uWs2", uWs2)
        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs2,0);

        // console.log("valueSourceRoad startUpCost",startUpCost)

        // console.log("valueSourceRoad", JSON.stringify(rtv))
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
        const startUpCost = CONSTRUCTION_COST[STRUCTURE_CONTAINER];
        //const runningCostRepair = 750;
        const runningCostRepair = CREEP_LIFE_TIME*CONTAINER_DECAY/
                                      (CONTAINER_DECAY_TIME*REPAIR_POWER);
        //console.log("valueSourceNoRoad runningCostRepair", runningCostRepair,"shoud be 750");

        const hWs = this.harvesterWsSource(energy/(CREEP_LIFE_TIME / ENERGY_REGEN_TIME), pathSpawn);
        const pCs = this.porterCsSource(energy/(CREEP_LIFE_TIME / ENERGY_REGEN_TIME), pathSpawn, pathController);
        const energy1 = energy - this.convertPartsToEnergy(hWs, pCs, hWs,0);
        const uWs1 = this.upgraderWsFromDistance(20, energy1); // guess 20
        const energy2 = energy - this.convertPartsToEnergy(hWs, pCs, uWs1,0);
        const uWs2 = this.upgraderWsFromDistance(20, energy2);
        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs2,0);
        //console.log("hWs", hWs, "pCs", pCs, "uWs2", uWs2);
        //console.log("valueSourceNoRoad", JSON.stringify({
        //    "parts": { "hW": hWs, "pC": pCs, "uW": uWs2 },
        //    "startUpCost": startUpCost,
        //    "runningCostRepair": runningCostRepair,
        //    "runningCostCreeps": creepCosts,
        //    "netEnergy": energy - runningCostRepair - creepCosts,
        //}));
        return {
            "parts": { "hW": hWs, "pC": pCs, "uW": uWs2 },
            "startUpCost": startUpCost,
            "runningCostRepair": runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": energy - runningCostRepair - creepCosts,
        };
    },

    convertPartsToEnergy(hWs, pCs, uWs, wWCs) { // harvester, porter, upgrader and worker sizes
        return (hWs/5)*800 + pCs*75 + uWs * 125 + 100 + wWCs*200;
    },

    workersRoomRationHtoW : function (room, spawnRoom, useRoad) {
        //console.log("b workersRoomRationHtoW room", room.name,"spawnRoom", spawnRoom.name, "useroad", useRoad);
        const sources = room.find(FIND_SOURCES);
        if (sources.length === 0) {
            return 1;
        }
        let avDistance = 0;
        let count = 0;
        for (let source of sources) {
            // todo expensive, maybe better caching
            const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: obj => { return obj.structureType !== STRUCTURE_WALL
                    && obj.structureType !== STRUCTURE_RAMPART;
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
        const workLt = CREEP_LIFE_TIME - avDistance;
        const tripTime = CARRY_CAPACITY/BUILD_POWER + 2*avDistance;
        const tripsLt = workLt/tripTime;
        const energyPerWLt = tripsLt * CARRY_CAPACITY;
        const energyPerHlt = workLt * 2;
        //console.log("room",room.name,"avDistance",avDistance,"sources", sources.length, "count", count);
        //console.log("workersRoomRationHtoW energyPerWLt",energyPerWLt,"tripsLt",tripsLt,"tripTime",tripTime,"workLt",workLt)
        return energyPerHlt / energyPerWLt;
    },

    harvesterWsRoom : function (sourceRoom, homeRoom, useRoad) {
        const sources = homeRoom.find(FIND_SOURCES);
        let wsRoom = 0;
        for (let i in sources) {
            const distance = cache.distanceSourceSpawn(sources[i], homeRoom, useRoad);
            wsRoom += this.harvesterWsSource(sources[i].energyCapacity, distance);
        }
        return wsRoom;
    },

// Ws needed for Energy =  Energy/(Lifetime * HarvestPower)
    harvesterWsSource : function (ec, distance) {
        //console.log("harvesterWsSource ec", ec, "distance", distance)
        const workLifetime = CREEP_LIFE_TIME - distance;
        const energyCollectedPerWorkPart = workLifetime * HARVEST_POWER;
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME);
        //console.log("harvesterWsSource maxEnergy", maxEnergy, "energyCollectedPerWorkPart", energyCollectedPerWorkPart);
        return maxEnergy / energyCollectedPerWorkPart;
    },
};

module.exports = budget;


































