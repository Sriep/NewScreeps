/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const assert = require("assert");
const C = require("../src/Constants");
const BattleQuickEstimate = require("../src/Battle_quick_estimate");
const bodies = require("./mocks/bodies");
const race = require("../src/race");
const gc = require("../src/gc");

describe("Battle_quick_estimate", function() {
    describe("quickCombat", function() {
        it("simulate source keep combat", function() {
            //console.log("sourceKeeper", JSON.stringify(sourceKeeper));
            /*
            const baneBody = race.bodyFromBodyCount(
                race.getBodyCounts(gc.RACE_PALADIN, 10000, 11)
            );
            //console.log(race.getBodyCounts(gc.RACE_PALADIN, 1000, 11).length,"race.getBodyCounts(gc.RACE_PALADIN, 1000, 11)",race.getBodyCounts(gc.RACE_PALADIN, 1000, 11))
            const keeperBane = {
                hits: baneBody.length*100,
                hitsMax: baneBody.length*100,
                body: baneBody,
            };
            //console.log("keeper bane", JSON.stringify(keeperBane));

            const result = BattleQuickEstimate.quickCombat(
                [bodies.sourceKeeper],
                [keeperBane]
            );
            console.log("simulate combat result", JSON.stringify(result));
            assert(result.enemies === []);

             */
        });

       // it("simulate combat", function() {
       //     const result = BattleQuickEstimate.quickCombat(
       //         [bodies.meleeRcl3],
       //         [bodies.swordsman]
       //     );
       //     //console.log("simulate combat result", JSON.stringify(result));
       //     assert(result.enemies === []);
       // });
    });
});