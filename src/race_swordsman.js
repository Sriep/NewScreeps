/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_swordsman = {
    AM_COST : C.BODYPART_COST[C.ATTACK] + C.BODYPART_COST[C.MOVE],

    bodyCounts: function (ec) {
        const size = Math.floor(ec/AM_COST);
        const tough = Math.floor( (ec - size*80+size*50)/60);
        return { [C.TOUGH]: tough, [C.MOVE] : size+tough, [C.ATTACK]: size };
    },

    isCivilian: function() {return false},

    boosts: [
        C.RESOURCE_CATALYZED_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_HYDRIDE,

        C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
        C.RESOURCE_ZYNTHIUM_ALKALIDE,
        C.RESOURCE_ZYNTHIUM_OXIDE,
    ]

};

module.exports = race_swordsman;