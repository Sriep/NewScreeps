/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */
//console.log("main.js start");
const gc = require("gc");
const inserted = require("inserted");
const state = require("state");
const policy = require("policy");
const flag = require("flag");
const records = require("records");
const profiler = require('screeps-profiler');

if (gc.USE_PROFILER) {
    // Any modules that you use that modify the game's prototypes should be require'd
    // before you require the profiler.

    // This line monkey patches the global prototypes.
    profiler.enable();

    //module.exports.loop = function() {
    //    profiler.wrap(function() {
        // Main.js logic should go here.
    //    });
    //};
}


module.exports.loop = function () {
    //console.log("main start");
    if (gc.USE_PROFILER) {
        profiler.wrap(function() {
            main()
        });
    } else {
        main()
    }
};

function main() {
    console.log("************************ Start ", Game.time," *********************************");
    inserted.top();
    if (!Memory.started) {
        startup();
        records.startup()
    }
    freeCreeps();
    enactPolicies();
    buildingAct();
    moveCreeps();
    spawnCreeps();
    inserted.bottom();
    console.log("cpu used", Game.cpu.getUsed(), "number of creeps", Object.keys(Game.creeps).length);
    console.log("cpu limit", Game.cpu.limit, "ticklimit", Game.cpu.tickLimit, "bucket", Game.cpu.bucket, "shardlimits", Game.cpu.shardLimits);
    console.log("************************ End ",  Game.time, " *********************************");
}

function startup() {
    Memory.started = true;
    Memory.records = {};
    Memory.records["started"] = Game.time;
    Memory.records.agenda = [];
    Memory.records.policies = {};
    Memory.records.policies.created = {};
    //Memory.records.policies.replaced = {};
    Memory.records.policies.initilise_failed = {};
}

function freeCreeps() {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            if (Game.flags[name]) {
                Game.flags[name].remove();
            }
            delete Memory.creeps[name];
        }
    }
}

function buildingAct() {
    for (let roomName in Game.rooms) {
        const buildings = Game.rooms[roomName].find(FIND_MY_STRUCTURES,  {
            filter: s => {
                return s.structureType === STRUCTURE_TOWER
                    || s.structureType ===  STRUCTURE_TERMINAL
                    || s.structureType ===  STRUCTURE_LAB
            }
        });
        for (let building of buildings) {
            //console.log("building",building,"type",building.structureType);
            state.enactBuilding(building)
        }
    }
}

function moveCreeps() {
    for (let name in Game.creeps) {
        //console.log(name,"creep pos", Game.creeps[name].pos);
        //console.log("move creeps before", name);
        state.enactCreep(Game.creeps[name]);
        //console.log("move creeps after", name);
    }
}

function enactPolicies() {
    policy.enactPolicies();
    //console.log("finish policies")
}

function spawnCreeps() {
    for (let i in Game.spawns) {
        console.log(i,"spawn", JSON.stringify(Game.spawns[i]));
        if (!Game.spawns[i].spawning) {
            flag.getSpawnQueue(Game.spawns[i].room.name).spawnNext(Game.spawns[i]);
        }
    }
}