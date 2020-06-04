/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_paladin = {
    // heal 250 attack 80 move 50
    // 14 attack 11 heal 25 move

    bodyCounts: function (ec) {
        const parts =  Math.floor(ec/this.WMC_COST);
        let  size = Math.min(parts, this.WORKER_MAX_SIZE);
        size = Math.min(16, size);
        return {[C.WORK]: size, [C.CARRY]: size, [C.MOVE] : size};
    },

    boosts: [
        C.RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
        C.RESOURCE_LEMERGIUM_ALKALIDE,
        C.RESOURCE_LEMERGIUM_OXIDE,

        C.RESOURCE_CATALYZED_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_HYDRIDE,

        C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
        C.RESOURCE_ZYNTHIUM_ALKALIDE,
        C.RESOURCE_ZYNTHIUM_OXIDE,
    ]

};

module.exports = race_paladin;