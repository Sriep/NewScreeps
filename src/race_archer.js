/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const raceArcher = {
    RM_COST : C.BODYPART_COST[C.RANGED_ATTACK] + C.BODYPART_COST[C.MOVE],
    RTMM_COST : C.BODYPART_COST[C.RANGED_ATTACK] + 2*C.BODYPART_COST[C.MOVE] +C.BODYPART_COST[C.TOUGH],
    TM_COST : C.BODYPART_COST[C.TOUGH] + C.BODYPART_COST[C.MOVE],

    bodyCounts: function (ec, tough) {
        if (tough) {
            const size = Math.floor(ec/this.RTMM_COST);
            const extraTMs = Math.floor( (ec - size*this.RTMM_COST)/this.TM_COST);
            return { [C.TOUGH]: size+ extraTMs, [C.MOVE] : size+extraTMs, [C.ATTACK]: size };
        } else {
            const size = Math.floor(ec/this.RM_COST);
            const toughs = Math.floor( (ec - size*this.RM_COST)/this.TM_COST);
            return { [C.TOUGH]: toughs, [C.MOVE] : size+toughs, [C.ATTACK]: size };
        }
    },

    isCivilian: function() { return false },

    boosts: [
        C.RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
        C.RESOURCE_KEANIUM_ALKALIDE,
        C.RESOURCE_KEANIUM_OXIDE,

        C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
        C.RESOURCE_GHODIUM_ALKALIDE,
        C.RESOURCE_GHODIUM_OXIDE,
    ]

};

module.exports = raceArcher;