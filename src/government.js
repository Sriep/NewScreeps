/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
//const Governor = require("governor");

const government = {
    governors: Memory.governors,

    govern: function() {
        myRooms = _.filter(Game.rooms, room => {
            return room.controller.my && room.controller.level > 0
        });
        for (let roomName in myRooms) {
            const Governor = require("governor");
            const governor = new Governor(roomName);
            governor.govern();
        }
    }
};

module.exports = government;