/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const flag = {
    flagRoom(roomName) {
        console.log("flag room",roomName)
    },

    getRoomFlag(roomName) {
        console.log("flag getRoomFlag roomName", roomName)
        let flag = Game.flags[roomName];
        if (!flag) {
            console.log("flag", roomName, "does not exist creatig");
            this.flagRoom(roomName);
            Game.rooms[roomName].controller.pos.createFlag(roomName);
            flag = Game.flags[roomName];
        }
        return flag;
    },

    getSpawnQueue(roomName) {
        //console.log("flag getSpawnQueue roomName", roomName)
        const QueueSpawn = require("queue_spawn");
        return new QueueSpawn(roomName);
    },
};

module.exports = flag;