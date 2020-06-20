/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_swordsman = {
    AM_COST : C.BODYPART_COST[C.ATTACK] + C.BODYPART_COST[C.MOVE],
    ATMM_COST : C.BODYPART_COST[C.ATTACK] + 2*C.BODYPART_COST[C.MOVE] +C.BODYPART_COST[C.TOUGH],
    TM_COST : C.BODYPART_COST[C.TOUGH] + C.BODYPART_COST[C.MOVE],

    bodyCounts: function (ec, tough) {
        if (tough) {
            const size = Math.floor(ec/this.ATMM_COST);
            const extraTMs = Math.floor( (ec - size*this.ATMM_COST)/this.TM_COST);
            return { [C.TOUGH]: size+ extraTMs, [C.MOVE] : size+extraTMs, [C.ATTACK]: size };
        } else {
            const size = Math.floor(ec/this.AM_COST);
            const toughs = Math.floor( (ec - size*this.AM_COST)/this.TM_COST);
            return { [C.TOUGH]: toughs, [C.MOVE] : size+toughs, [C.ATTACK]: size };
        }
    },

    isCivilian: function() { return false },

    boosts: [
        C.RESOURCE_CATALYZED_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_HYDRIDE,

        C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
        C.RESOURCE_GHODIUM_ALKALIDE,
        C.RESOURCE_GHODIUM_OXIDE,

        C.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
        C.RESOURCE_ZYNTHIUM_ALKALIDE,
        C.RESOURCE_ZYNTHIUM_OXIDE,
    ]

};

module.exports = race_swordsman;