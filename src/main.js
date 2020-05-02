/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */

const inserted = require("inserted");
const gc = require("gc");
const state = require("state");
const rooms = require("rooms");
const policy = require("policy");


module.exports.loop = function () {
    console.log("************************ Start ", Game.time," *********************************");
    inserted.top();

    freeCreeps();
    flagRooms();

    //console.log("************************ Move creeps start *********************************");
    moveCreeps();
    //console.log("************************ Move creeps finish *********************************");
    //console.log("cpu used before policies act", Game.cpu.getUsed());

    policy.enactPolicies();
    inserted.bottom();

    console.log("cpu used", Game.cpu.getUsed(), "number of creeps", Object.keys(Game.creeps).length);
    console.log("cpu limit", Game.cpu.limit, "ticklimit", Game.cpu.tickLimit, "bucket", Game.cpu.bucket, "shardlimits", Game.cpu.shardLimits);
    console.log("************************ End ",  Game.time, " *********************************");

}

function freeCreeps() {
    for(let c in Memory.creeps) {
        if(!Game.creeps[c]) {
            delete Memory.creeps[c];
        }
    }
}

function moveCreeps() {
    //console.log("main in moveCreeps")
    for (let name in Game.creeps) {
        //console.log("creep", name)
        state.enactCreep(Game.creeps[name]);
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