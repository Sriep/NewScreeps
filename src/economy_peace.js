/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const economy = require("economy");

const economy_peace = {

    nextSpawn: function (policy) {
        console.log("run economyPeace nextSpawn", roomId, spawnId, "porterShortfall", economy.porterShortfall(policy));
    }

}

module.exports = economy_peace;