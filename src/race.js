/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
//const flag = require("flag");
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
        return this.getCostBody(bodyCounts);
    },

    getCostBody(bodyCounts) {
        let cost = 0;
        if (bodyCounts[C.WORK]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.WORK];
        }
        if (bodyCounts[C.MOVE]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.MOVE];
        }
        if (bodyCounts[C.CARRY]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.CARRY];
        }
        if (bodyCounts[C.ATTACK]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.ATTACK];
        }
        if (bodyCounts[C.RANGED_ATTACK]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.RANGED_ATTACK];
        }
        if (bodyCounts[C.TOUGH]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.TOUGH];
        }
        if (bodyCounts[C.HEAL]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.HEAL];
        }
        if (bodyCounts[C.CLAIM]) {
            cost += bodyCounts[C.WORK]*C.BODYPART_COST[C.CLAIM];
        }
    },

    body: function (race, ec) {
        const bodyCounts = this.getBodyCounts(race,ec);
        if (!bodyCounts){
            return undefined;
        }
        let body = [];

        for (let i = 0; i < bodyCounts[C.WORK]; i++) {
            body.push(C.WORK);
        }
        if (bodyCounts[MOVE] < 1) {
            return undefined;
        }
        for (let i = 0; i < bodyCounts[C.MOVE]; i++) {
            body.push(C.MOVE);
        }
        for (let i = 0; i < bodyCounts[C.CARRY]; i++) {
            body.push(C.CARRY);
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
            if (body[i] === C.WORK) {
                Ws++;
            }
        }
        return Ws;
    },

    repairPower: function(creep) {
        return this.workParts(creep) * C.REPAIR_POWER;
    },

};

module.exports = race;