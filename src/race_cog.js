/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */

const race_cog = {

    bodyCounts: function (ec) {
        const carry =  Math.min(49, (ec-BODYPART_COST[MOVE])/BODYPART_COST[WORK]);
        return {"work": 0, "carry": carry, "move" : 1};
    },

    boosts: [
        { priority : 3, resource: RESOURCE_KEANIUM_HYDRIDE, part : CARRY },
        { priority : 1, resource: RESOURCE_LEMERGIUM_HYDRIDE, part : WORK },
        { priority : 2, resource: RESOURCE_ZYNTHIUM_OXIDE, part : MOVE },

        { priority : 3, resource : RESOURCE_KEANIUM_ACID, part : CARRY },
        { priority : 1, resource : RESOURCE_LEMERGIUM_ACID, part : WORK },
        { priority : 2, resource : RESOURCE_ZYNTHIUM_ALKALIDE, part : MOVE },

        { priority : 3, resource : RESOURCE_CATALYZED_KEANIUM_ACID, part : CARRY },
        { priority : 1, resource : RESOURCE_CATALYZED_LEMERGIUM_ACID, part : WORK },
        { priority : 2, resource : RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, part : MOVE },
    ]

};

module.exports = race_cog;