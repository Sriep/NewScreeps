/**
 * @fileOverview screeps
 * Created by piers on 19/05/2020
 * @author Piers Shepperson
 */
const cache = require("cache");

const memory = {

    values(awayRoomName, spawnRoomName) {
        return  cache.global(
            values,
            "values" + awayRoomName + spawnRoomName,
            [awayRoomName, spawnRoomName],
            true
        );
    }
};

values = function(awayRoomName, spawnRoomName) {
    //console.log("memory values awayRoomName",awayRoomName,"spawnRoomName",spawnRoomName);
    return JSON.parse(Game.flags[awayRoomName].memory.rooms[spawnRoomName]["values"]);
};

module.exports = memory;