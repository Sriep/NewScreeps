/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("../src/Constants");
const BattleQuickEstimate = require("../src/Battle_quick_estimate");

const meleeRcl3 = {
    hits: 1000,
    hitsMax: 1000,
    body: [
        {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
        {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
        {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
        {"type":C.RANGED_ATTACK,"hits":100}, {"type":C.WORK,"hits":100},
        {"type":C.ATTACK,"hits":100}, {"type":C.MOVE,"hits":100},
    ]
};

const swordsman3 = {
    hits: 1400,
    hitsMax: 1400,
    body: [
        {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
    ]
};

const paladin3 = {
    hits: 1400,
    hitsMax: 1400,
    body: [
        {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
    ]
};


describe("Battle_quick_estimate", function() {
    describe("quickCombat", function() {
        it("simulate combat", function() {
            const result = BattleQuickEstimate.quickCombat([meleeRcl3], [swordsman])
            console.log("simulate combat result", JSON.stringify(result));

        });
    });
});