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
        const workers = _.filter(Game.creeps, c => {
            return race.getRace(c) === gc.RACE_WORKER
        });
        const harvesters = _.filter(Game.creeps, c => {
            return c.memory.targetId && race.getRace(c) === gc.RACE_HARVESTER
        });
        Memory.routes = {};
        Memory["workers"] = workers.length;
        for (let harvester of harvesters) {
            if (!Memory.routes[harvester.memory.targetId]) {
                Memory.routes[harvester.memory.targetId] = {};
                Memory.routes[harvester.memory.targetId]["harvesters"] = [];
                Memory.routes[harvester.memory.targetId]["porters"] = [];
            }
            Memory.routes[harvester.memory.targetId]["harvesters"].push(harvester.name)
        }

        const porters = _.filter(Game.creeps, c => {
            return race.getRace(c) === gc.RACE_PORTER
                && c.memory.targetId
                && c.memory.state === gc.STATE_MOVE_POS
                && c.memory.state === gc.STATE_PORTER_TRANSFER
        });
        for (let porter in porters) {
            if (!Memory.routes[porter.memory.targetId]) {
                Memory.routes[porter.memory.targetId] = {};
                Memory.routes[porter.memory.targetId]["harvesters"] = [];
                Memory.routes[porter.memory.targetId]["porters"] = [];
            }
            Memory.routes[porter.memory.targetId]["porters"].push(porter.name)
        }
        console.log("routes", JSON.stringify(Memory.routes));

    }
};

module.exports = inserted;


/*
        if (!Memory.w) {
        Memory.w = 2;
        }
        if (!Memory.n) {
            Memory.n =2;
        }
        Memory.n++;
        if (Memory.n > 10) {
            Memory.n = 0;
            Memory.w++
        }
        if (Memory.w > 10) {
            return;
        }
        const name = "W" + Memory.w.toString() + "N" + Memory.n.toString();
        console.log("n", Memory.n, "w",Memory.w, "name",name);
        const terrain = new Room.Terrain(name);
        console.log(name, "terrain", JSON.stringify(terrain.getRawBuffer()));
*/
//for (let w = 2 ; w < 10 ; w++) {
//    for (let n = 2 ; n <10 ; n++) {
//        const name = "W" + w.toString() + "N" + n.toString();
//        const terrain = new Room.Terrain("E2S7");
//        console.log(name, "terrain", JSON.stringify(terrain.getRawBuffer()))
//    }
//}

//console.log("--------- piers inserted done ------------")












