/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const flag = require("flag");
//const gf = require("gf");

const race = {
    NUMBER_ROLE_TYPES: 6,
    LoadTime: {"harvester": 25, "upgrader": 25, "builder":25, "repairer": 25
        , "energy.porter" : 0, "flexi.storage.porter" : 0},

    OffloadTime: {"harvester": 1, "upgrader": 50, "builder":5, "repairer": 50
        , "energy.porter" : 40 , "flexi.storage.porter" : 40},

    getRace: function (creep) {
        return creep.name.split("_")[0];
    },

    getBodyCounts(race, ec) {
        const raceModule = require("race_" + race);
        return raceModule.bodyCounts(ec);
    },

    getCost(race, ec) {
        const bodyCounts = this.getBodyCounts(race, ec);
        let cost = 0;
        if (bodyCounts[WORK]) {
            cost += bodyCounts[WORK]*BODYPART_COST[WORK];
        }
        if (bodyCounts[MOVE]) {
            cost += bodyCounts[WORK]*BODYPART_COST[MOVE];
        }
        if (bodyCounts[CARRY]) {
            cost += bodyCounts[WORK]*BODYPART_COST[CARRY];
        }
        if (bodyCounts[ATTACK]) {
            cost += bodyCounts[WORK]*BODYPART_COST[ATTACK];
        }
        if (bodyCounts[RANGED_ATTACK]) {
            cost += bodyCounts[WORK]*BODYPART_COST[RANGED_ATTACK];
        }
        if (bodyCounts[TOUGH]) {
            cost += bodyCounts[WORK]*BODYPART_COST[TOUGH];
        }
        if (bodyCounts[HEAL]) {
            cost += bodyCounts[WORK]*BODYPART_COST[HEAL];
        }
        if (bodyCounts[CLAIM]) {
            cost += bodyCounts[WORK]*BODYPART_COST[CLAIM];
        }
    },

    body: function (race, ec) {
        const bodyCounts = this.getBodyCounts(race,ec);
        if (!bodyCounts){
            return undefined;
        }
        let body = [];

        for (let i = 0; i < bodyCounts[WORK]; i++) {
            body.push(WORK);
        }
        if (bodyCounts[MOVE] < 1) {
            return undefined;
        }
        for (let i = 0; i < bodyCounts[MOVE]; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < bodyCounts[CARRY]; i++) {
            body.push(CARRY);
        }
        return body;
    },

    partsFromBody: function(body, part) {
        let count=0;
        for (let i in body) {
            if (body[i] === part) {
                count++
            }
        }
        return count;
    },

    partsFromBody2: function(body, part) {
        let count=0;
        for (let i in body) {
            if (body[i].type === part) {
                count++
            }
        }
        return count;
    },

    creepPartsAlive(policyId, race, part) {
        const creeps = _.filter(Game.creeps, function (c) {
            return c.memory.policyId === policyId
                && race === c.name.split("_")[0]
        });
        let partsLeft = 0;
        for (let creep of creeps) {
            partsLeft += this.partsFromBody2(creep.body, part);
        }
        return partsLeft;
    },

    ticksLeftByPart(policyId, race, part) {
        const creeps = _.filter(Game.creeps, function (c) {
            return c.memory.policyId === policyId
                && race === c.name.split("_")[0]
        });
         let lifeLeft = 0;
        for (let creep of creeps) {
            const parts = this.partsFromBody2(creep.body, part);
            lifeLeft += creep.ticksToLive * parts;
        }
        return lifeLeft;
    },

    workParts: function(creep) {
        const body = creep.body;
        let Ws = 0;
        for (let i in body) {
            if (body[i] === WORK) {
                Ws++;
            }
        }
        return Ws;
    },

    repairPower: function(creep) {
        return workParts(creep) * REPAIR_POWER;
    },

    sendOrderToQueue : function(room, cRace, energy, policyId, priority) {
        const data = {
            body: this.body(cRace, energy),
            name: cRace,// + "_" + energy.toString(),
        };
        const queue = flag.getSpawnQueue(room.name);
        return queue.addSpawn(data, priority, policyId,  cRace + "_idle");
    },
};

module.exports = race;