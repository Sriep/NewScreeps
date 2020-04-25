/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */

const inserted = require("inserted");
const gc = require("gc");
const role = require("role");
const rooms = require("rooms");
const policy = require("policy");


module.exports.loop = function () {
    console.log("cpu limit", Game.cpu.limit, "ticklimit", Game.cpu.tickLimit, "bucket", Game.cpu.bucket, "shardlimits", Game.cpu.shardLimits);
    console.log("************************ Start ", Game.time," *********************************");
    inserted.top();

    freeCreeps();
    flagRooms();
    policy.enactPolicies();
    moveCreeps();

    inserted.bottom();
    console.log("************************ End ",  Game.time, " *********************************");
}

function freeCreeps() {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            Memory.creeps[name] = undefined;
        }
    }
}

function moveCreeps() {
    //console.log("main in moveCreeps")
    for (let name in Game.creeps) {
        role.enact(Game.creeps[name]);
    }
}

function flagRooms() {
    let force;
    if (Game.time % gc.FLAG_UPDATE_RATE === 0 ) {

    }
    force = true;
    for ( let room in Game.rooms ) {
        //console.log("flagRooms about to flag ", Game.rooms[room])
        //console.log("flagRooms room.memory", Game.rooms[room].memory)
        if ( (Game.rooms[room].memory && !Game.rooms[room].memory.flagged) || force ) {
            rooms.flag(Game.rooms[room]);
        }
    }
}