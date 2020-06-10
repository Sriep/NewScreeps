/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_healer = {
    HM_COST : C.BODYPART_COST[C.HEAL] + C.BODYPART_COST[C.MOVE],
    TM_COST : C.BODYPART_COST[C.TOUGH] + C.BODYPART_COST[C.MOVE],
    HMMT_COST : C.BODYPART_COST[C.HEAL] + 2*C.BODYPART_COST[C.MOVE] + C.BODYPART_COST[C.TOUGH],

    bodyCounts: function (ec) {
        const size = Math.floor(ec/this.HMMT_COST);
        const tough = Math.floor( (ec - size*this.HMMT_COST)/this.TM_COST);
        return { [C.TOUGH]: size+tough, [C.MOVE] : 2*size+tough, [C.HEAL]: size };
    },

    isCivilian: function() { return false },

    boosts: [
        C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
        C.RESOURCE_LEMERGIUM_ALKALIDE,
        C.RESOURCE_LEMERGIUM_OXIDE,

        C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
        C.RESOURCE_GHODIUM_ALKALIDE,
        C.RESOURCE_GHODIUM_OXIDE,
    ]

};

module.exports = race_healer;