/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_worker = {
    WORKER_MAX_SIZE: 16,
    WMC_COST: 100 + 50 + 50,

    bodyCounts: function (ec) {
        const parts =  Math.floor(ec/this.WMC_COST);
        let  size = Math.min(parts, this.WORKER_MAX_SIZE);
        size = Math.min(16, size);
        return {[C.WORK]: size, [C.CARRY]: size, [C.MOVE] : size};
    },

    boosts: [
        C.RESOURCE_CATALYZED_LEMERGIUM_ACID,
        C.RESOURCE_LEMERGIUM_ACID,
        C.RESOURCE_LEMERGIUM_HYDRIDE,
        //C.RESOURCE_CATALYZED_KEANIUM_ACID,
        //C.RESOURCE_KEANIUM_ACID,
        //C.RESOURCE_KEANIUM_HYDRIDE,
        //C.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
        //C.RESOURCE_ZYNTHIUM_ALKALIDE,
        //C.RESOURCE_ZYNTHIUM_OXIDE,
    ]

};

module.exports = race_worker;