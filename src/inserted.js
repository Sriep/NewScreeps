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
//const gc = require("gc");
//const gf = require("gf");
//const race = require("race");

const inserted = {
    top: function () {
       //const home = Game.rooms["W7N7"];
    },

    bottom: function () {


        //console.log("--------- piers inserted------------");
        //for (let creep in Game.creeps) {
        //    console.log(Game.creeps[creep].name, "is in room",Game.creeps[creep].pos.roomName)
        //}



        //const away = "W8N2";
        //const home = "W7N7";
        //const myValue  = budget.valueNeutralRoom(away, home, false);
        //console.log("value W7N7 W8N7", JSON.stringify(myValue[gc.ROOM_NEUTRAL]));
        //console.log("22222--------- piers inserted------------");
        //console.log("stored vaue", Game.flags["W8N7"]["values"])


        //for (let roomName in Game.flags) {
          //  if (Game.flags[roomName].memory.values) {
               // console.log(roomName,"  ",Game.flags[roomName].memory.values)
            //}
        //}W8N7
        //console.log("befire",Memory.N,  Memory.W);
       /* if (Memory.N === undefined) {
            Memory.N = 0;
            Memory.W = 0;
        } else {
            //console.log("else",Memory.N,  Memory.W);
            if (Memory.N < 11) {
                Memory.N = Memory.N + 1;
                //console.log("after Memory.N = Memory.N + 1",Memory.N,  Memory.W);
            } else {
                Memory.N = 0;
                Memory.W = Memory.W + 1
               // console.log("after Memory.W = Memory.W + 1",Memory.N,  Memory.W);
            }
        }
        //console.log("after",Memory.N,  Memory.W);

        //for (let n = 0 ; n <= 10 ; n++) {
          //  for (let w = 0 ;  w <= 10 ; n++) {
        if (Memory.N <11 && Memory.W < 11) {
            let rawData = new Uint8Array(2500);
            const roomName = "W" + Memory.W.toString() + "N" + Memory.N.toString();
            console.log(roomName);
            const terrain = Game.map.getRoomTerrain(roomName);
            terrain.getRawBuffer(rawData);
            console.log(roomName,":  ", JSON.stringify(rawData));
        }*/

            //}
        //}



        //console.log("--------- piers inserted done ------------")
    }

};

module.exports = inserted;















