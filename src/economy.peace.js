/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");

const economyPeace = {

    run: function (roomId) {
        //console.log("run economy peace for", roomId)
        const spawns = Game.rooms[roomId].find(FIND_MY_SPAWNS);
        //console.log("run spawns", spawns)
        for (let spawn in spawns) {
            //console.log("run peace spawn", spawn, "spawn obj", spawns[spawn]);
            //console.log("spawn pos",spawns[spawn].pos);
            if (spawns[spawn].spawning === null) {
                this.nextSpawn(roomId, spawn)
            }
        }
    },

    nextSpawn: function (roomId, spawnId) {
        console.log("run economyPeace nextSpawn", roomId, spawnId);
    }

}

module.exports = economyPeace;