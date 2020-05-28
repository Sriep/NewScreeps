/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const C = require("./Constants");

const race_lorry = {
    CCM_COST: 2*C.BODYPART_COST[C.CARRY] + C.BODYPART_COST[C.MOVE],

    bodyCounts: function (ec) {
        const size = Math.min(17, Math.floor(ec/this.CCM_COST));
        return {"work": 0, "carry": 2*size, "move" : size}
    },

    boosts: [
        { priority : 1, resource: C.RESOURCE_KEANIUM_HYDRIDE, part : C.CARRY },
        { priority : 2, resource: C.RESOURCE_ZYNTHIUM_OXIDE, part : C.MOVE },

        { priority : 1, resource : C.RESOURCE_KEANIUM_ACID, part : C.CARRY },
        { priority : 2, resource : C.RESOURCE_ZYNTHIUM_ALKALIDE, part : C.MOVE },

        { priority : 1, resource : C.RESOURCE_CATALYZED_KEANIUM_ACID, part : C.CARRY },
        { priority : 2, resource : C.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, part : C.MOVE },
    ]

};

module.exports = race_lorry;