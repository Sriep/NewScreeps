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
            wsRoom += this.harvesterWsSource(sources[i], homeRoom);
        }
        //console.log("harvesterWsRoom result", wsRoom)
        return wsRoom;
    },

    // Ws needed for Energy =  Energy/(Lifetime * HarvestPower)
    harvesterWsSource: function (source, homeRoom) {
        const travel = cache.distanceSourceSpawn(source, homeRoom)
        //console.log("harvesterWsSource travel", travel)
        const workLifetime = CREEP_LIFE_TIME - travel;
        //console.log("harvesterWsSource workLifetime", workLifetime, "harvest power", HARVEST_POWER)
        const energyCollectedPerWorkPart = workLifetime * HARVEST_POWER;
        const maxEnergy = source.energyCapacity * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        //console.log("source.energyCapacity",source.energyCapacity, "energyCollectedPerWorkPart", energyCollectedPerWorkPart)
        return maxEnergy / energyCollectedPerWorkPart;
    },

    portersCsRoom: function (sourceRoom, homeRoom) {
        const sources = homeRoom.find(FIND_SOURCES);
        let csRoom = 0;
        for (let i in sources) {
            csRoom += this.porterCsSource(sources[i], homeRoom);
        }
        //console.log("portersCsRoom result", csRoom)
        return csRoom;
    },

    // Cs need for Energh = Energy * Trips per life / (Lifetime + carry amount)
    porterCsSource: function (source, homeRoom) {
        const initial = cache.distanceSourceSpawn(source, homeRoom)
        const repeat = cache.distanceSourceController(source, homeRoom)
        //console.log("porterCsSource initial", initial, "repeat",repeat)
        const workLifetime = CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / repeat;
        const energyPortedPerCarryPart = tripsPerLife * CARRY_CAPACITY;
        const maxEnergy = source.energyCapacity * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        return maxEnergy / energyPortedPerCarryPart;
    },

    // Ws needed = Energy / ( Liftime - distance)
    upgradersWsRoom: function (room, energy) {
        const travel = cache.distanceUpgraderSpawn(room.contoller, homeRoom);
        const workLifetime = CREEP_LIFE_TIME - travel;
        const energySentPerWorkPart = workLifetime * UPGRADE_CONTROLLER_POWER;
        const maxEnergy = energy * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME);
        return maxEnergy / energySentPerWorkPart;
    },

    spawnPartsLT(room) {
        energyCapacity = room.energyCapacity(room)
        spawns = room.find(FIND_MY_SPAWNS);
        return { // { 15000, 500 }
            energyLT: energyCapacity * CREEP_LIFE_TIME,
            creepPartsLT: Math.floor(CREEP_LIFE_TIME / CREEP_SPAWN_TIME)
        };
    },

    valueRoom(room, home, status) {
        const owned = "username" in room.controller.owner;

    }

}

module.exports = budget;


































