/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const C = require("./Constants");

const race_porter = {
    CM_COST: C.BODYPART_COST[C.CARRY] + C.BODYPART_COST[C.MOVE],
    CCM_COST: 2*C.BODYPART_COST[C.CARRY] + C.BODYPART_COST[C.MOVE],

    bodyCounts: function (ec, slow) {
        if (slow) {
            const size = Math.min(16, Math.floor(ec/this.CCM_COST));
            return {"work": 0, "carry": 2*size, "move" : size}
        } else {
            const size = Math.min(25, Math.floor(ec/this.CM_COST));
            return {"work": 0, "carry": size, "move" : size}
        }

    },

    boosts: [
        C.RESOURCE_CATALYZED_KEANIUM_ACID,
        C.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
        C.RESOURCE_KEANIUM_ACID,
        C.RESOURCE_ZYNTHIUM_ALKALIDE,
        C.RESOURCE_KEANIUM_HYDRIDE,
        C.RESOURCE_ZYNTHIUM_OXIDE,
    ]

};

module.exports = race_porter;