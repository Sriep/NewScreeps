/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");

const economy = {
    run: function (roomId) {
        let economyType = Memory.rooms[roomId].economy;
        //console.log("economy run economyType", economyType, "roomId", roomId)
        if (!economyType) {
            economyType = gc.ECONOMY_PEACE;
        }
        //const economy = require("economy." + economyType);
        economy.run(roomId);
    }
}

module.exports = economy;