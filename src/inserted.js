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
        //console.log("centre1", JSON.stringify(Game.flags["W7N7"].Memory))
        //console.log("centre2", JSON.stringify(Memory.flags["W7N7"].plan))
        //console.log("centre3", JSON.stringify(Game.flags["W7N7"].Memory.plan))
        //const governor = policy.getGouvernerPolicy("W7N7");
        //console.log("m.colonies", JSON.stringify(governor.m.colonies));
        //console.log("governor", JSON.stringify(governor));

        //let room = Game.rooms["W7N7"];
        //console.log("W7N7 owner", JSON.stringify(room.controller.owner), "reserver", JSON.stringify(room.controller.reservation));

        //room = Game.rooms["W7N8"];
        //if (room) {
        //    console.log("W8N7 owner", JSON.stringify(room.controller.owner), "reserver", JSON.stringify(room.controller.reservation));
        //}


        //room = Game.rooms["W3N4"];
        //console.log("w7n7 owner", room.controller.owner, "reserver", JSON.stringify(room.controller.reservation))

        //room = Game.rooms["W7N7"];
        //console.log("w7n7 owner", room.controller.owner, "reserver", JSON.stringify(room.controller.reservation))

        //room = Game.rooms["W7N7"];
        //console.log("w7n7 owner", room.controller.owner, "reserver", JSON.stringify(room.controller.reservation))


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
        //console.log("routes", JSON.stringify(Memory.routes));

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












