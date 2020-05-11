/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */

const cache = require("cache");
const gc = require("gc");
const race = require("race");
const gf = require("gf");

const budget = {

    harvesterWsRoom: function (sourceRoom, homeRoom, useRoad) {
        //console.log("bu harvesterWsRoom", sourceRoom, homeRoom, useRoad)
        const sources = homeRoom.find(FIND_SOURCES);
        let wsRoom = 0;
        for (let i in sources) {
            const distance = cache.distanceSourceSpawn(sources[i], homeRoom, useRoad);
            //console.log("bu harvesterWsRoom distance",distance)
            wsRoom += this.harvesterWsSource(sources[i].energyCapacity, distance);
        }
        //console.log("bu harvesterWsRoom result", wsRoom);
        return wsRoom;
    },

    // Ws needed for Energy =  Energy/(Lifetime * HarvestPower)
    harvesterWsSource: function (ec, distance) {
        //console.log("harvesterWsSource travel", distance)
        const workLifetime = CREEP_LIFE_TIME - distance;
        //console.log("harvesterWsSource workLifetime", workLifetime, "harvest power", HARVEST_POWER)
        const energyCollectedPerWorkPart = workLifetime * HARVEST_POWER;
        //console.log("bu energyCollectedPerWorkPart",energyCollectedPerWorkPart,"workLifetime",workLifetime)
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME);
        //console.log("bu maxEnergy",maxEnergy,"ec",ec,"CREEP_LIFE_TIME",CREEP_LIFE_TIME,"ENERGY_REGEN_TIME",ENERGY_REGEN_TIME)
        //console.log("bu source.energyCapacity",ec, "energyCollectedPerWorkPart", energyCollectedPerWorkPart, "maxEnergy", maxEnergy)
        //console.log("bu harvesterWsSource", maxEnergy / energyCollectedPerWorkPart);
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
            csRoom += this.porterCsSource(sources[i].energyCapacity, initial, repeat);
        }
        //console.log("bu portersCsRoom result", csRoom)
        return csRoom;
    },

    // Cs need for Energh = Energy * Trips per life / (Lifetime + carry amount)
    porterCsSource: function (ec, initial, repeat) {
        //console.log("porterCsSource initial", initial, "repeat",repeat)
        const workLifetime = CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / repeat;
        const energyPortedPerCarryPart = tripsPerLife * CARRY_CAPACITY;
        //console.log("tripsPerLife",tripsPerLife);
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME);
        //console.log("maxEnergy", maxEnergy,"energyPortedPerCarryPart",energyPortedPerCarryPart)
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
        //console.log("budget upgraderWsFromDistance distance", distance, "energy", energy)
        const workLifetime = CREEP_LIFE_TIME - distance;
        const energySentPerWorkPart = workLifetime * UPGRADE_CONTROLLER_POWER;
        return energy / energySentPerWorkPart;
    },

    workersRoomRationHtoW: function (room, useRoad) {
        const sources = room.find(FIND_SOURCES);
        let avDistance = 0;
        for (let source of sources) {
            // todo more accurate calculation. spawns*accespoints to construction sites.
            avDistance += cache.distanceSourceSpawn(source, room, useRoad);
        }
        avDistance = avDistance/sources.length;
        const workLt = CREEP_LIFE_TIME - avDistance;
        const tripTime = CARRY_CAPACITY/BUILD_POWER + 2*avDistance;
        const tripsLt = workLt/tripTime;
        const energyPerWLt = tripsLt * CARRY_CAPACITY;
        //console.log("budget workerWsRoom energyPerWLt",energyPerWLt,"avDistance",avDistance);
        const energyPerHlt = workLt * 2;
        //console.log("ratioHtoW",ratioHtoW,"energyPerHlt",energyPerHlt,"energyPerWLt",energyPerWLt);
        return energyPerHlt / energyPerWLt;
    },

    workerRoom: function(room, numWorkers) {
        const workerCost = numWorkers * race.getCost(gc.RACE_WORKER, gf.roomEc(room));
        //console.log("budgetWorkerRoom", workerCost);
        const wsPerWorker = race.getBodyCounts(gc.RACE_WORKER, gf.roomEc(room));
        //const dSourceSpawn = cache.distanceSourceSpawn(sources[i], room, false);
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

        //console.log("wsPerWorker * numWorkers * energyWLt", wsPerWorker * numWorkers * energyWLt);
        return wsPerWorker * numWorkers * energyWLt - workerCost;
    },

    porterRoom: function (room) {
        const budgetHarvesterWs = budget.harvesterWsRoom(room, room, false);
        //console.log("budget poerters room", gf.roomEc(room));
        const budgetUpgradersWs =  budget.upgradersWsRoom(room, gf.roomEc(room), false);
        const portersCsRoom = budget.portersCsRoom(room, room, false);

        const harvesterCount = Math.ceil(budgetHarvesterWs*gc.WWM_COST/gf.roomEc(room));
        //const porterCount = Math.ceil(portersCsRoom*gc.CCM_COST/gf.roomEc(room));
        const upgradersCount = Math.ceil(budgetUpgradersWs*gc.WWM_COST/gf.roomEc(room));
        //console.log("budgetUpgradersWsLT",budgetUpgradersWsLT,"portersCsRoom",portersCsRoom,"budgetHarvesterWsLt",budgetHarvesterWsLt)

        const harvestersCost = budgetHarvesterWs*gc.WWM_COST + harvesterCount*BODYPART_COST[CARRY];
        const upgradersCost = budgetUpgradersWs*gc.WWM_COST + upgradersCount*BODYPART_COST[CARRY];
        const portersCost =  portersCsRoom*gc.CCM_COST;

        const creepUpkeep = harvestersCost + upgradersCost + portersCost;
        //console.log("porterRoom budgetUpgradersWs",budgetUpgradersWs,"upgradersCost",upgradersCost);

        const netEnergy = 5*2*SOURCE_ENERGY_CAPACITY - creepUpkeep;
        const parts = budgetHarvesterWs*3+ budgetUpgradersWs*3 + portersCsRoom*3 + harvesterCount + upgradersCount;
        //console.log("budget 5*2*SOURCE_ENERGY_CAPACITY",5*2*SOURCE_ENERGY_CAPACITY,"creepUpkeep",creepUpkeep);
        //console.log("budget budgetHarvesterWs",budgetHarvesterWs,"budgetUpgradersWs",budgetUpgradersWs,
        //    "portersCsRoom",portersCsRoom,"harvesterCoun",harvesterCount,"upgradersCount",upgradersCount)

        //console.log("budget porterRoom", JSON.stringify({ "net energy" : netEnergy, "parts" :  parts }))
        return { "net_energy" : netEnergy, "parts" :  parts };
    },

    spawnPartsLT: function (room) {
        energyCapacity = room.energyCapacity(room);
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

    valueNeutralRoom: function (roomName, home, force) {
        room = Game.rooms[roomName];
        if (!room) {
            return {};
        }
        if (!room.controller) {
            return { "no controller" : true }
        }

        //console.log("room", room, "home", home);
        const sources = room.find(FIND_SOURCES);
        const spawns = home.find(FIND_MY_SPAWNS);
        const values = {};
        values[gc.ROOM_NEUTRAL] = {"setup": 0, "profit": 0, "parts" : 0};
        values[gc.ROOM_NEUTRAL_ROADS] = {"setup": 0, "profit": 0, "parts" : 0};
        values[gc.ROOM_RESERVED] = {"setup": 0, "profit": 0, "parts" : 0};
        values[gc.ROOM_RESERVED_ROADS] = {"setup": 0, "profit": 0, "parts" : 0};
        values[gc.ROOM_OWNED] = {"setup": 0, "profit": 0, "parts" : 0};
        values[gc.ROOM_OWNED_ROADS] = {"setup": 0, "profit": 0, "parts" : 0};

        let sourcePathsRoad = [];
        let sourcePathNoRoad = [];
        if (sources.length === 0) {
            console.log("valueNeutralRoom no sources in room", room.name);
            values["no source"] = true;
            return values;
        }

        for (let source of sources) {
            //console.log("sourcePathNoRoad finding... source", sources[i].pos);
            const spnr = cache.path(source, spawns, "spawn", 1, false, force);
            sourcePathNoRoad.push(spnr);
            //console.log("sourcePathNoRoad", JSON.stringify(spnr), "sourcePathsRoad");
            sourcePathsRoad.push(cache.path(source, spawns, "spawn", 1, true, force));
        }
        console.log("roomName pathToControllerRoad ...");
        console.log("valueNeutralRoom room", room.name, "controller",room.controller,"id",room.controller.id );
        const pathToControllerRoad = cache.path(room.controller, spawns, "controller", 1, true, force);
        console.log("pathToControllerNoRoad ... pathToControllerRoad", JSON.stringify(pathToControllerRoad));
        const pathToControllerNoRoad = cache.path(room.controller, spawns, "controller", 1, false, force);
        //console.log("paths done pathToControllerNoRoad", JSON.stringify(pathToControllerNoRoad))
        for (let i in sources) {
            //console.log("nnr")
            const nnr = this.valueSourceNoRoad(sourcePathNoRoad[i], pathToControllerNoRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_NEUTRAL_CAPACITY);
            values[gc.ROOM_NEUTRAL][sources[i].id] = nnr;
            values[gc.ROOM_NEUTRAL]["parts"] += nnr.parts;
            values[gc.ROOM_NEUTRAL]["setup"] += nnr.startUpCost;
            values[gc.ROOM_NEUTRAL]["profit"] += nnr.netEnergy;
            //console.log("nr")
            const nr = this.valueSourceRoad(sourcePathsRoad[i], pathToControllerRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_NEUTRAL_CAPACITY);
            values[gc.ROOM_NEUTRAL_ROADS][sources[i].id] = nr;
            values[gc.ROOM_NEUTRAL_ROADS]["parts"] += nr.parts;
            values[gc.ROOM_NEUTRAL_ROADS]["setup"] += nr.startUpCost;
            values[gc.ROOM_NEUTRAL_ROADS]["profit"] += nr.netEnergy;
            //console.log("rnr")
            const rnr = this.valueSourceNoRoad(sourcePathNoRoad[i], pathToControllerNoRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED][sources[i].id] = rnr;
            values[gc.ROOM_RESERVED]["parts"] += rnr.parts;
            values[gc.ROOM_RESERVED]["setup"] += rnr.startUpCost;
            values[gc.ROOM_RESERVED]["profit"] += rnr.netEnergy;
            values[gc.ROOM_OWNED][sources[i].id] = rnr;
            values[gc.ROOM_OWNED]["parts"] += rnr.parts;
            values[gc.ROOM_OWNED]["setup"] += rnr.startUpCost;
            values[gc.ROOM_OWNED]["profit"] += rnr.netEnergy;
            //console.log("rr")
            const rr = this.valueSourceNoRoad(sourcePathsRoad[i], pathToControllerRoad, gc.SORCE_REGEN_LT*SOURCE_ENERGY_CAPACITY);
            values[gc.ROOM_RESERVED_ROADS][sources[i].id] = rr;
            values[gc.ROOM_RESERVED_ROADS]["parts"] += rr.parts;
            values[gc.ROOM_RESERVED_ROADS]["setup"] += rr.startUpCost;
            values[gc.ROOM_RESERVED_ROADS]["profit"] += rr.netEnergy;
            values[gc.ROOM_OWNED_ROADS][sources[i].id] = rr;
            values[gc.ROOM_OWNED_ROADS]["parts"] += rr.parts;
            values[gc.ROOM_OWNED_ROADS]["setup"] += rr.startUpCost;
            values[gc.ROOM_OWNED_ROADS]["profit"] += rr.netEnergy;
        }
        //console.log("reserver cost no road", this.reserverCost(room, spawns, false, force),
        //    "reserver cost road", this.reserverCost(room, spawns, true, force))
        values[gc.ROOM_RESERVED]["profit"] -= this.reserverCost(room, spawns, false, force);
        values[gc.ROOM_RESERVED_ROADS]["profit"] -= this.reserverCost(room, spawns, true, force);
        values[gc.ROOM_RESERVED]["parts"] += 2;
        values[gc.ROOM_RESERVED_ROADS]["parts"] += 6;
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
            "parts": 3*hWs + 3*pCs + 3*uWs1,
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
                                      (CONTAINER_DECAY_TIME*REPAIR_POWER);
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
            "parts": 3*hWs + 3*pCs + 3*uWs1,
            "startUpCost": startUpCost,
            "runningCostRepair": runningCostRepair,
            "runningCostCreeps": creepCosts,
            "netEnergy": energy - runningCostRepair - creepCosts,
        };
    },

    convertPartsToEnergy(hWs, pCs, uWs) {
        return hWs*125+50 + pCs*75 + uWs*125+50;
    },

};

module.exports = budget;


































