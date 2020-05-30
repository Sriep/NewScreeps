/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */

const inserted = require("inserted");
const state = require("state");
const policy = require("policy");
const flag = require("flag");
const records = require("records");

module.exports.loop = function () {
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

};

function startup() {
    Memory.started = true;
    Memory.records = {};
    Memory.records["started"] = Game.time;
    Memory.records.agenda = [];
    Memory.records.policies = {};
    Memory.records.policies.created = {};
    Memory.records.policies.replaced = {};
    Memory.records.policies.initilise_failed = {};
}

function freeCreeps() {
    for(let name in Memory.creeps) {
        if (Game.flags[name]) {
            Game.flags[name].remove();
        }
        if(!Game.creeps[name]) {
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
        state.enactCreep(Game.creeps[name]);
    }
}

function enactPolicies() {
    policy.enactPolicies();
}

function spawnCreeps() {
    for (let i in Game.spawns) {
        if (!Game.spawns[i].spawning) {
            flag.getSpawnQueue(Game.spawns[i].room.name).spawnNext(Game.spawns[i]);
        }
    }
}