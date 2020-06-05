/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const C = require("../src/Constants");
const BattleQuickEstimate = require("../src/Battle_quick_estimate");
const bodies = require("./mocks/bodies");


describe("Battle_quick_estimate", function() {
    describe("quickCombat", function() {
        it.skip("simulate combat", function() {
            const result = BattleQuickEstimate.quickCombat(
                [bodies.meleeRcl3],
                [bodies.swordsman]
            );
            console.log("simulate combat result", JSON.stringify(result));
        });
        it.skip("simulate source keep combat", function() {
            const result = BattleQuickEstimate.quickCombat(
                [bodies.meleeRcl3],
                [bodies.swordsman]
            );
            console.log("simulate combat result", JSON.stringify(result));
        });
    });
});