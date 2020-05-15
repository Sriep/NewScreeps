/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const rooms = require("rooms");


const flag = {
    flagRoom(roomName) {
        rooms.flag(Game.rooms[roomName]);
    },

    getRoomFlag(roomName) {
        let roomFlag = Game.flags[roomName];
        if (!roomFlag) {
            this.flagRoom(roomName);
            if (!Game.flags[roomName]) {
                const center = new RoomPosition(25, 25, room.name);
                center.createFlag(room.name);
            }
            roomFlag = Game.flags[roomName];
        }
        return roomFlag;
    },

    getSpawnQueue(roomName) {
        const QueueSpawn = require("queue_spawn");
        //console.log("flag getSpawnQueue roomName", roomName);
        //console.log("flag getSpawnQueue" ,roomName,"queue", JSON.stringify(queue));
        return new QueueSpawn(roomName);
    },
};

module.exports = flag;