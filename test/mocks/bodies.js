/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
const C = require("../../src/Constants");

const bodies = {
    meleeRcl3 : {
        hits: 1000,
        hitsMax: 1000,
        body: [
            {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
            {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
            {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
            {"type":C.RANGED_ATTACK,"hits":100}, {"type":C.WORK,"hits":100},
            {"type":C.ATTACK,"hits":100}, {"type":C.MOVE,"hits":100},
        ]
    },

    rangedRcl3 : {
        hits: 1000,
        hitsMax: 1000,
        body: [
            {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
            {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
            {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
            {"type":C.RANGED_ATTACK,"hits":100}, {"type":C.RANGED_ATTACK,"hits":100},
            {"type":C.RANGED_ATTACK,"hits":100}, {"type":C.MOVE,"hits":100},
        ]
    },

    healerRcl3 : {
        hits: 1000,
        hitsMax: 1000,
        body: [
            {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
            {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
            {"type":C.HEAL,"hits":100}, {"type":C.HEAL,"hits":100},
            {"type":C.HEAL,"hits":100}, {"type":C.HEAL,"hits":100},
            {"type":C.HEAL,"hits":100}, {"type":C.MOVE,"hits":100},
        ]
    },

    meleeRcl4: {
        hits: 5000,
        hitsMax: 5000,
        body: [
            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},
            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},

            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},
            {"type":"tough","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"work","hits":100},{"type":"work","hits":100},
            {"type":"work","hits":100},{"type":"work","hits":100},{"type":"attack","hits":100},{"type":"attack","hits":100},{"type":"move","hits":100},
        ]
    },

    ramgedRcl4: {
        hits: 5000,
        hitsMax: 5000,
        body: [
            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},
            {"type":"tough","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},
            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},

            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},
            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"work","hits":100},{"type":"move","hits":100},
        ]
    },

    healerRcl4: {
        hits: 5000,
        hitsMax: 5000,
        body: [
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"heal","hits":100},
            {"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},

            {"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},
            {"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},

            {"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},
            {"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"heal","hits":100},{"type":"move","hits":100},
        ]
    },

    sourceKeeper: {
        hits: 5000,
        hitsMax: 5000,
        body: [
            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},
            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},

            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"tough","hits":100},
            {"type":"tough","hits":100},{"type":"tough","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},
            {"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},{"type":"move","hits":100},

            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"attack","hits":100},
            {"type":"ranged_attack","hits":100},{"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"attack","hits":100},{"type":"ranged_attack","hits":100},

            {"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"attack","hits":100},
            {"type":"ranged_attack","hits":100},{"type":"attack","hits":100},{"type":"ranged_attack","hits":100},{"type":"attack","hits":100},{"type":"ranged_attack","hits":100}
        ],

    },

    SOURCE_KEEPER_BODY_ARRAY: [
        C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.
        TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.TOUGH,C.MOVE,C.MOVE,C.MOVE,C.
        MOVE,C.MOVE,C.MOVE,C.MOVE,C.MOVE,C.MOVE,C.MOVE,C.MOVE,C.MOVE,C.MOVE,C.
        ATTACK,C.RANGED_ATTACK,C.ATTACK,C.RANGED_ATTACK,C.ATTACK,C.
        RANGED_ATTACK,C.ATTACK,C.RANGED_ATTACK,C.ATTACK,C.RANGED_ATTACK,C.
        ATTACK,C.RANGED_ATTACK,C.ATTACK,C.RANGED_ATTACK,C.ATTACK,C.
        RANGED_ATTACK,C.ATTACK,C.RANGED_ATTACK,C.ATTACK,C.RANGED_ATTACK
    ],

};

module.exports = bodies;