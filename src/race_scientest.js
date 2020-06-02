/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_scientist = {

    bodyCounts: function (ec) {
        const carry =  Math.min(49, (ec-BODYPART_COST[MOVE])/BODYPART_COST[WORK]);
        return {"work": 0, "carry": carry, "move" : 1};
    },

    boosts: [
        C.RESOURCE_CATALYZED_KEANIUM_ACID,
        C.RESOURCE_KEANIUM_ACID,
        C.RESOURCE_KEANIUM_HYDRIDE,
    ]

};

module.exports = race_scientist;