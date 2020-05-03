/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */

const cache = require("cache");

const budget = {

    harvesterWsRoom: function (sourceRoom, homeRoom) {
        const sources = homeRoom.find(FIND_SOURCES);
        let wsRoom = 0;
        for (let i in sources) {
            const distance = cache.distanceSourceSpawn(sources[i], homeRoom)
            //console.log("harvesterWsRoom distance",distance)
            wsRoom += this.harvesterWsSource(sources[i].energyCapacity, distance);
        }
        //console.log("harvesterWsRoom result", wsRoom)
        return wsRoom;
    },

    // Ws needed for Energy =  Energy/(Lifetime * HarvestPower)
    harvesterWsSource: function (ec, distance) {
        //console.log("harvesterWsSource travel", travel)
        const workLifetime = CREEP_LIFE_TIME - distance;
        //console.log("harvesterWsSource workLifetime", workLifetime, "harvest power", HARVEST_POWER)
        const energyCollectedPerWorkPart = workLifetime * HARVEST_POWER;
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        //console.log("source.energyCapacity",source.energyCapacity, "energyCollectedPerWorkPart", energyCollectedPerWorkPart)
        return maxEnergy / energyCollectedPerWorkPart;
    },

    portersCsRoom: function (sourceRoom, homeRoom) {
        const sources = homeRoom.find(FIND_SOURCES);
        let csRoom = 0;
        for (let i in sources) {
            const initial = cache.distanceSourceSpawn(sources[i], homeRoom)
            //console.log("portersCsRoom distanceSourceSpawn", initial)
            const repeat = cache.distanceSourceController(sources[i], homeRoom)
            //console.log("portersCsRoom distanceSourceController", repeat)
            csRoom += this.porterCsSource(sources[i].energyCapacity, initial, repeat);
        }
        //console.log("portersCsRoom result", csRoom)
        return csRoom;
    },

    // Cs need for Energh = Energy * Trips per life / (Lifetime + carry amount)
    porterCsSource: function (ec, initial, repeat) {
        //console.log("porterCsSource initial", initial, "repeat",repeat)
        const workLifetime = CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / repeat;
        const energyPortedPerCarryPart = tripsPerLife * CARRY_CAPACITY;
        const maxEnergy = ec * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        return maxEnergy / energyPortedPerCarryPart;
    },

    // Ws needed = Energy / ( Liftime - distance)
    upgradersWsRoom: function (room, energy) {
        const travel = cache.distanceUpgraderSpawn(room.contoller, homeRoom);
        this.upgraderWsFromDistance(travel, energy);
    },

    upgraderWsFromDistance: function(distance, energy) {
        const workLifetime = CREEP_LIFE_TIME - distance;
        const energySentPerWorkPart = workLifetime * UPGRADE_CONTROLLER_POWER;
        const maxEnergy = energy * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME);
        return maxEnergy / energySentPerWorkPart;
    },

    spawnPartsLT: function (room) {
        energyCapacity = room.energyCapacity(room)
        spawns = room.find(FIND_MY_SPAWNS);
        return { // { 15000, 500 }
            energyLT: energyCapacity * CREEP_LIFE_TIME,
            creepPartsLT: Math.floor(CREEP_LIFE_TIME / CREEP_SPAWN_TIME)
        };
    },

    valueRoom: function (room, home) {
        const owned = "username" in room.controller.owner;
        let sourceEnergy = 0
        const sources = room.find(FIND_SOURCES);
        for (let i in sources) {
            this.valueSource(source[i], home)
        }
    },

    valueSource: function (source, home) {
        const owned = "username" in source.room.controller.owner;
        const energy = source.energyCapacity
        const pathObj = pathSourceSpawn(source, home);

        path = deserialisePath(pathObj.path)
        console.log("path", JSON.stringify(path))
        roadLength = path.length;
        cost = path.cost;

    },

    valueSourceWithDistance: function (ec, dStart, dReapat) {
        wHs = harvesterWsSource(ec, d);
        cPs = porterCsSource(ec, dStart, dReapat);

    }





}

module.exports = budget;


































