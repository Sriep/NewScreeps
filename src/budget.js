/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */

const cache = require("cache");
const gc = require("gc");

const budget = {

    harvesterWsRoom: function (sourceRoom, homeRoom, useRoad) {
        //console.log("bu harvesterWsRoom", sourceRoom, homeRoom, useRoad)
        const sources = homeRoom.find(FIND_SOURCES);
        let wsRoom = 0;
        for (let i in sources) {
            const distance = cache.distanceSourceSpawn(sources[i], homeRoom, useRoad)
            //console.log("bu harvesterWsRoom distance",distance)
            wsRoom += this.harvesterWsSource(gc.SORCE_REGEN_LT*sources[i].energyCapacity, distance);
        }
        //console.log("bu harvesterWsRoom result", wsRoom)
        return wsRoom;
    },

    // Ws needed for Energy =  Energy/(Lifetime * HarvestPower)
    harvesterWsSource: function (ec, distance) {
        //console.log("harvesterWsSource travel", distance)
        const workLifetime = CREEP_LIFE_TIME - distance;
        //console.log("harvesterWsSource workLifetime", workLifetime, "harvest power", HARVEST_POWER)
        const energyCollectedPerWorkPart = workLifetime * HARVEST_POWER;
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        //console.log("maxEnergy",maxEnergy,"ec",ec,"CREEP_LIFE_TIME",CREEP_LIFE_TIME,"ENERGY_REGEN_TIME",ENERGY_REGEN_TIME)
        //console.log("source.energyCapacity",ec, "energyCollectedPerWorkPart", energyCollectedPerWorkPart, "maxEnergy", maxEnergy)
        //console.log("harvesterWsSource", maxEnergy / energyCollectedPerWorkPart)
        return maxEnergy / energyCollectedPerWorkPart;
    },

    portersCsRoom: function (sourceRoom, homeRoom, useRoad) {
        const sources = homeRoom.find(FIND_SOURCES);
        let csRoom = 0;
        for (let i in sources) {
            const initial = cache.distanceSourceSpawn(sources[i], homeRoom, useRoad);
            //console.log("portersCsRoom distanceSourceSpawn", initial)
            const repeat = cache.distanceSourceController(sources[i], homeRoom, useRoad);
            //console.log("portersCsRoom distanceSourceController", repeat)
            csRoom += this.porterCsSource(gc.SORCE_REGEN_LT*sources[i].energyCapacity, initial, repeat);
        }
        //console.log("bu portersCsRoom result", csRoom)
        return csRoom;
    },

    // Cs need for Energh = Energy * Trips per life / (Lifetime + carry amount)
    porterCsSource: function (ec, initial, repeat) {
        console.log("porterCsSource initial", initial, "repeat",repeat)
        const workLifetime = CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / repeat;
        const energyPortedPerCarryPart = tripsPerLife * CARRY_CAPACITY;
        console.log("tripsPerLife",tripsPerLife);
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        console.log("maxEnergy", maxEnergy,"energyPortedPerCarryPart",energyPortedPerCarryPart)
        return maxEnergy / energyPortedPerCarryPart;
    },

    // Ws needed = Energy / ( Liftime - distance)
    upgradersWsRoom: function (room, energy, useRoad) {
        const travel = cache.distanceUpgraderSpawn(room, room, useRoad);
        //const upgradersWsRoom = this.upgraderWsFromDistance(travel, energy);
        //console.log("bu upgradersWsRoom", upgradersWsRoom);
        return this.upgraderWsFromDistance(travel, energy);
    },

    upgraderWsFromDistance: function(distance, energy) {
        const workLifetime = CREEP_LIFE_TIME - distance;
        const energySentPerWorkPart = workLifetime * UPGRADE_CONTROLLER_POWER;
        return energy / energySentPerWorkPart;
    },

    budgetWorkerRoom: function(room, numWorkers) {
        wsPerWorker = race.getBodyCounts(gc.RACE_WORKER, room.energyCapacityAvailable);
        const dSourceSpawn = cache.distanceSourceSpawn(sources[i], room, false);
        const sources = room.find(FIND_SOURCES);
        let dAvSourceController = 0;
        for (let source of sources) {
            dAvSourceController += cache.distanceSourceController(source, room, false);
        }
        dAvSourceController = dAvSourceController / sources.length;
        const energyTrip = CARRY_CAPACITY/UPGRADE_CONTROLLER_POWER + UPGRADE_CONTROLLER_POWER/HARVEST_POWER;
        const tripsLt = (CREEP_LIFE_TIME - dSourceSpawn)/(2*dAvSourceController);
        const energyWLt = energyTrip * tripsLt;

        workerCost = numWorkers -
        return wsPerWorker * numWorkers * energyWLt;
    },

    spawnPartsLT: function (room) {
        energyCapacity = room.energyCapacity(room)
        spawns = room.find(FIND_MY_SPAWNS);
        return { // { 15000, 500 }
            energyLT: energyCapacity * CREEP_LIFE_TIME,
            creepPartsLT: Math.floor(CREEP_LIFE_TIME / CREEP_SPAWN_TIME)
        };
    },

    reserverCost(neutral, spawns, useRoad, force) {
        const path = cache.path(neutral.controller, spawns, "spawn", 1, useRoad, force);
        const Us = CREEP_LIFE_TIME/((CREEP_CLAIM_LIFE_TIME - path.cost)*UPGRADE_CONTROLLER_POWER);
        return useRoad ? 650*Us : 850*Us;
    },

    valueNeutralRoom: function (room, home, force) {
        console.log("room", room, "home", home);
        const sources = room.find(FIND_SOURCES);
        const spawns = home.find(FIND_MY_SPAWNS);
        const values = {};
        values[gc.ROOM_NEUTRAL] = {'setup': 0, 'profit': 0};
        values[gc.ROOM_NEUTRAL_ROADS] = {'setup': 0, 'profit': 0};
        values[gc.ROOM_RESERVED] = {'setup': 0, 'profit': 0};
        values[gc.ROOM_RESERVED_ROADS] = {'setup': 0, 'profit': 0};
        values[gc.ROOM_OWNED] = {'setup': 0, 'profit': 0};
        values[gc.ROOM_OWNED_ROADS] = {'setup': 0, 'profit': 0};

        let sourcePathsRoad = [];
        let sourcePathNoRoad = [];
        for (let i in sources) {
            sourcePathsRoad.push(cache.path(sources[i], spawns, "spawn", 1, true, force))
            sourcePathNoRoad.push(cache.path(sources[i], spawns, "spawn", 1, false, force))
        }
        const pathToControllerRoad = cache.path(home.controller, spawns, "controller", 1, true, force)
        const pathToControllerNoRoad = cache.path(home.controller, spawns, "controller", 1, false, force)
        for (let i in sources) {
            //console.log("nnr")
            const nnr = this.valueSourceNoRoad(sourcePathNoRoad[i], pathToControllerNoRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_NEUTRAL_CAPACITY);
            values[gc.ROOM_NEUTRAL][sources[i].id] = nnr;
            values[gc.ROOM_NEUTRAL]["setup"] += nnr.startUpCost;
            values[gc.ROOM_NEUTRAL]["profit"] += nnr.netEnergy;
            //console.log("nr")
            const nr = this.valueSourceRoad(sourcePathsRoad[i], pathToControllerRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_NEUTRAL_CAPACITY);
            values[gc.ROOM_NEUTRAL_ROADS][sources[i].id] = nr;
            values[gc.ROOM_NEUTRAL_ROADS]["setup"] += nr.startUpCost;
            values[gc.ROOM_NEUTRAL_ROADS]["profit"] += nr.netEnergy;
            //console.log("rnr")
            const rnr = this.valueSourceNoRoad(sourcePathNoRoad[i], pathToControllerNoRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED][sources[i].id] = rnr;
            values[gc.ROOM_RESERVED]["setup"] += rnr.startUpCost;
            values[gc.ROOM_RESERVED]["profit"] += rnr.netEnergy;
            values[gc.ROOM_OWNED][sources[i].id] = rnr;
            values[gc.ROOM_OWNED]["setup"] += rnr.startUpCost;
            values[gc.ROOM_OWNED]["profit"] += rnr.netEnergy;
            //console.log("rr")
            const rr = this.valueSourceNoRoad(sourcePathsRoad[i], pathToControllerRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED_ROADS][sources[i].id] = rr;
            values[gc.ROOM_RESERVED_ROADS]["setup"] += rr.startUpCost;
            values[gc.ROOM_RESERVED_ROADS]["profit"] += rr.netEnergy;
            values[gc.ROOM_OWNED_ROADS][sources[i].id] = rr;
            values[gc.ROOM_OWNED_ROADS]["setup"] += rr.startUpCost;
            values[gc.ROOM_OWNED_ROADS]["profit"] += rr.netEnergy;
        }
        //console.log("reserver cost no road", this.reserverCost(room, spawns, false, force),
        //    "reserver cost road", this.reserverCost(room, spawns, true, force))
        values[gc.ROOM_RESERVED]["profit"] -= this.reserverCost(room, spawns, false, force);
        values[gc.ROOM_RESERVED_ROADS]["profit"] -= this.reserverCost(room, spawns, true, force);
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
        if (!swamps) swamps = 0;

        const startUpCost = (pathController.cost - swamps)*CONSTRUCTION_COST[STRUCTURE_ROAD]
            + swamps *CONSTRUCTION_COST[STRUCTURE_ROAD]* CONSTRUCTION_COST_ROAD_SWAMP_RATIO
            + CONSTRUCTION_COST[STRUCTURE_CONTAINER];

        //console.log("pathSpawn",pathSpawn.cost,"pathController",pathController.cost,"energy",energy)
        const runningCostRepair = (pathController.cost - swamps)*1.5 + swamps*7.5 + 750;
        const hWs = this.harvesterWsSource(energy, pathSpawn.cost);
        //console.log("hWs = this.harvesterWsSource", hWs)
        const pCs = this.porterCsSource(energy, pathSpawn.cost, pathController.cost);
        const energy1 = energy - this.convertPartsToEnergy(hWs, pCs, hWs) - runningCostRepair;
        const uWs1 = this.upgraderWsFromDistance(20, energy1); // guess 20
        const energy2 = energy -this.convertPartsToEnergy(hWs, pCs, uWs1) - runningCostRepair;
        const uWs2 = this.upgraderWsFromDistance(20, energy2);
        //console.log("hWs", hWs, "pCs", pCs, "uWs2", uWs2)
        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs2);

        //console.log("valueSourceRoad startUpCost",startUpCost)

        //console.log("valueSourceRoad", JSON.stringify(rtv))
        return {
            "startUpCost": startUpCost,
            "runningCostRepair": runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": energy - runningCostRepair - creepCosts,
        };
    },

    valueSourceNoRoad: function (pathSpawn, pathController, energy) {
        //console.log("pathSpawn",pathSpawn.cost,"pathController",pathController.cost,"energy",energy)

        const startUpCost = CONSTRUCTION_COST[STRUCTURE_CONTAINER];
        //const runningCostRepair = 750;
        const runningCostRepair = CREEP_LIFE_TIME*CONTAINER_DECAY/
                                      (CONTAINER_DECAY_TIME*REPAIR_POWER)
        //console.log("valueSourceNoRoad runningCostRepair", runningCostRepair,"shoud be 750");

        const hWs = this.harvesterWsSource(energy, pathSpawn.cost);
        const pCs = this.porterCsSource(energy, pathSpawn.cost, pathController.cost);
        const energy1 = energy - 2*hWs*125 + pCs*75;
        const uWs1 = this.upgraderWsFromDistance(20, energy1); // guess 20
        const energy2 = energy - hWs*125 +  pCs*75 + uWs1*125;
        const uWs2 = this.upgraderWsFromDistance(20, energy2);
        const creepCosts = this.convertPartsToEnergy(hWs, pCs, uWs2);
        //console.log("hWs", hWs, "pCs", pCs, "uWs2", uWs2)

        //console.log("valueSourceNoRoad", JSON.stringify(rtv))
        return {
            "startUpCost": startUpCost,
            "runningCostRepair": runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": energy - runningCostRepair - creepCosts,
        };
    },

    convertPartsToEnergy(hWs, pCs, uWs) {
        return hWs*125+50 + pCs*75 + uWs*125+50;
    },

}

module.exports = budget;


































