/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */

const inserted = require("inserted");
const gc = require("gc");
const state = require("state");
//const rooms = require("rooms");
const policy = require("policy");
const flag = require("flag");

module.exports.loop = function () {
    console.log("************************ Start ", Game.time," *********************************");
    inserted.top();
    if (!Memory.started) {
        startup();
    }
    freeCreeps();
    flagRooms();

    moveCreeps();
    enactPolicies();
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
    Memory.records.policies = {};
    Memory.records.policies.created = {};
    Memory.records.policies.replaced = {};
    Memory.records.policies.initilise_failed = {};
}

function freeCreeps() {
    for(let c in Memory.creeps) {
        if(!Game.creeps[c]) {
            delete Memory.creeps[c];
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
            //console.log("main spawn loop energy avaliable", Game.spawns[i].room.energyAvailable);
            //if (Game.spawns[i].room.energyAvailable >= BODYPART_COST[MOVE]) {
                //console.log("main spawnCreeps about to get queue");
                const q = flag.getSpawnQueue(Game.spawns[i].room.name);
                //console.log("main spawnCreeps",Game.spawns[i].room.name,  "queue is", JSON.stringify(q));
                const r= q.spawnNext(Game.spawns[i]);
                //console.log("spawn at", Game.spawns[i].room.name,"result", r)
            //}
        }
    }
}

function flagRooms() {
    let force = false;
    if (Game.time % gc.FLAG_UPDATE_RATE === 0 ) {
        force = true;
    }
    for ( let roomName in Game.rooms ) {
        if ( (Game.rooms[roomName].memory && (!Game.rooms[roomName].memory.flagged) || force) ) {
            flag.flagRoom(roomName);
            //rooms.flag(Game.rooms[room]);
        }
    }

}