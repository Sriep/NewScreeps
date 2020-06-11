/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */
// const economy = require("economy")
    //const budget = require("budget");

//const budget = require("budget");
//const construction = require("construction");
//const policy = require("policy");
const gc = require("gc");
//const gf = require("gf");
const race = require("race");

const inserted = {
    top: function () {

    },

    bottom: function () {
        //console.log("--------- piers inserted------------");

/*
        const workers = _.filter(Game.creeps, c => {
            return race.getRace(c) === gc.RACE_WORKER
        });
        const allPorters = _.filter(Game.creeps, c => {
            return race.getRace(c) === gc.RACE_PORTER
        });
        const harvesters = _.filter(Game.creeps, c => {
            return c.memory.targetId && race.getRace(c) === gc.RACE_HARVESTER
        });
        Memory.routes = {};
        Memory.routes["workers"] = workers.length;
        Memory.routes["porters"] = allPorters.length;
        for (let harvester of harvesters) {
            if (!Memory.routes[harvester.memory.targetId]) {
                Memory.routes[harvester.memory.targetId] = {};
                Memory.routes[harvester.memory.targetId]["room"] = harvester.room.name;
                Memory.routes[harvester.memory.targetId]["harvesters"] = [];
                Memory.routes[harvester.memory.targetId]["porters"] = [];
            }
            Memory.routes[harvester.memory.targetId]["harvesters"].push(harvester.name)
        }

        const porters = _.filter(allPorters, c => {
            return c.memory.targetId
                && c.memory.state === gc.STATE_MOVE_POS
                && c.memory.state === gc.STATE_PORTER_TRANSFER
        });
        for (let porter in porters) {
            if (!Memory.routes[porter.memory.targetId]) {
                Memory.routes[porter.memory.targetId] = {};
                Memory.routes[harvester.memory.targetId]["room"] = porter.room.name;
                Memory.routes[porter.memory.targetId]["harvesters"] = [];
                Memory.routes[porter.memory.targetId]["porters"] = [];
            }
            Memory.routes[porter.memory.targetId]["porters"].push(porter.name)
        }
        */

    }
};

module.exports = inserted;













