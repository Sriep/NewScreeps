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
        //console.log("getRoomFlag roomName", roomName)
        let flag = Game.flags[roomName];
        if (!flag) {
            this.flagRoom(roomName);
            flag = Game.rooms[roomName].controller.pos.createFlag(roomName);
        }
        return flag;
    },

    getSpawnQueue(roomName) {
        //console.log("getSpawnQueue roomName", roomName)
        const QueueSpawn = require("queue_spawn");
        return new QueueSpawn(roomName);
    },
};

module.exports = flag;