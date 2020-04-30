/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */

const race_harvester = require("race_harvester");
const cache = require("cache");

const budget = {

    harvesterWsRoom: function (sourceRoom, homeRoom) {
        const sources = room.find(FIND_SOURCES);
        let wsRoom = 0;
        for (let i in sources) {
            wsRoom += harvesterWsSource(sources[i], homeRoom);
        }
        return wsRoom;
    },

    // Ws needed for Energy =  Energy/(Lifetime * HarvestPower)
    harvesterWsSource: function (source, homeRoom) {
        const travel = cache.distanceSourceSpawn(source, homeRoom)
        const workLifetime = CREEP_LIFE_TIME - travel;
        const energyCollectedPerWorkPart = workLifetime * HARVEST_POWER;
        return source.energyCapacity / energyCollectedPerWorkPart;
    },

    portersCsRoom: function (sourceRoom, homeRoom) {
        const sources = room.find(FIND_SOURCES);
        let csRoom = 0;
        for (let i in sources) {
            csRoom += porterCsSource(sources[i], homeRoom);
        }
        return csRoom;
    },

    //Cs need for Energh = Energy * Trips per life / (Lifetime + carry amount)
    porterCsSource: function (sourceRoom, homeRoom) {
        const initial = cache.distanceSourceSpawn(source, homeRoom)
        const repeat = cache.distanceSourceController(source, homeRoom)
        const workLifetime = CREEP_LIFE_TIME - initial;
        const tripsPerLife = workLifetime / repeat;
        const energyPortedPerCarryPart = tripsPerLife * CARRY_CAPACITY;
        return source.energyCapacity / energyPortedPerCarryPart;
    }



}

module.exports = budget;