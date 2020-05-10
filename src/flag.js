/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const rooms = require("rooms");


const flag = {
    flagRoom(roomName) {
        //console.log("flag room",roomName, "room obj", Game.rooms[roomName])
        rooms.flag(Game.rooms[roomName]);
    },

    getRoomFlag(roomName) {
        //console.log("flag getRoomFlag roomName", roomName)
        let flag = Game.flags[roomName];
        if (!flag) {
            this.flagRoom(roomName);
            if (!Game.rooms[roomName] || !Game.rooms[roomName].controller) {
                return undefined;
            }
            Game.rooms[roomName].controller.pos.createFlag(roomName);
            flag = Game.flags[roomName];
        }
        return flag;
    },

    getSpawnQueue(roomName) {
        const QueueSpawn = require("queue_spawn");
        //console.log("flag getSpawnQueue roomName", roomName);
        //console.log("flag getSpawnQueue" ,roomName,"queue", JSON.stringify(queue));
        return new QueueSpawn(roomName);
    },
};

module.exports = flag;