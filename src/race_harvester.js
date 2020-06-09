/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const C = require("./Constants");

const race_harvester = {
    COST_WWM : 2*C.BODYPART_COST[C.WORK] + C.BODYPART_COST[C.MOVE],
    bodyCounts: function (ec, freeSize) {
        if (freeSize) {
            const size = Math.min(16, Math.floor((ec-C.BODYPART_COST[C.CARRY])/this.COST_WWM));
            return {"work": 2*size, "carry": 1, "move" : size};
        }
        if (ec < gc.MIN_HARVESTER_EC) {
            return {"work": 0, "carry": 0, "move" : 0};
        }
        if (ec > gc.MAX_HARVESTER_EC) {
            return gc.HARVESTER_BODY_COUNTS[gc.MAX_HARVESTER_EC];
        }
        return gc.HARVESTER_BODY_COUNTS[Math.floor(ec/50) * 50];
    },

    isCivilian: function() {return true},

    boosts: [
        C.RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
        C.RESOURCE_UTRIUM_ALKALIDE,
        C.RESOURCE_UTRIUM_OXIDE,
    ]
};

module.exports = race_harvester;