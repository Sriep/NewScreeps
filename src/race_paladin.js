/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gf = require("./gf");

const race_paladin = {
    DEFAULT_RATIO: 11/14,
    DEFAULT_MAX_HEAL: 11,
    MIN_EC: C.BODYPART_COST[C.HEAL] + C.BODYPART_COST[C.ATTACK] + 2*C.BODYPART_COST[C.MOVE],

    // 250h+80a+50c <= ec; h+a=c; h(ratio) = a;
    bodyCounts: function (ec, maxHeal) {
        gf.assert(0< maxHeal && maxHeal < 25, "paladin must have both heal and attack parts");
        if (ec < this.MIN_EC) {
            return {"work": 0, "carry": 0, "move" : 0};
        }
        maxHeal = maxHeal ? maxHeal : this.DEFAULT_MAX_HEAL;
        const ratio = maxHeal/(25-maxHeal);
        const heal = Math.min( maxHeal,  Math.floor(ec/(300+ratio*130)));
        const attack = Math.min(25-maxHeal, Math.floor( ec*ratio/(300 + ratio*130)));
        const move = heal + attack;
        const tough = Math.floor( (ec - heal*250+attack*80+move*50)/60);

        return { [C.TOUGH]: tough, [C.MOVE] : move+tough,  [C.HEAL]: heal, [C.ATTACK]: attack};
    },

    isCivilian: function() {return false},

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