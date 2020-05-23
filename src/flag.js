/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const rooms = require("rooms");
const flag = {
    flagRoom(roomName, force) {
        rooms.flag(Game.rooms[roomName], force);
    },

    getRoomFlag(roomName) {
        //console.log("getRoomFlag", roomName);
        let roomFlag = Game.flags[roomName];
        if (!roomFlag) {
            this.flagRoom(roomName);
            roomFlag = Game.flags[roomName]
        }
        return roomFlag;
    },

    getSpawnQueue(roomName) {
        const QueueSpawn = require("queue_spawn");
        return new QueueSpawn(roomName);
    },
};

module.exports = flag;