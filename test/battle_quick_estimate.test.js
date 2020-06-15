/**
 * @fileOverview screeps
 * Created by piers on 04/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require("assert");
const C = require("../src/Constants");
const BattleQuickEstimate = require("../src/Battle_quick_estimate");
const bodies = require("./mocks/bodies");
const race = require("../src/race");


describe("quickCombat", function() {
    describe("combat invader rcl<4", function() {
        it("simulate sorwdsman vrs invader", function() {
            const invader = bodies.meleeRcl3.body;

            let defender300 = race.bodyFromBodyCount(
                race.getBodyCounts(gc.RACE_SWORDSMAN, 300)
            );
            //console.log("defender", JSON.stringify(race.getBodyCounts(gc.RACE_SWORDSMAN, ec)));
            let result300 = BattleQuickEstimate.quickCombat(
                [defender300],
                [invader],
                gc.MAX_SIM_BATTLE_LENGTH,
                false
            );
            //console.log("simulate combat result", result300);
            assert.strictEqual(result300.friends.length, 0);


            defender500 = race.bodyFromBodyCount(
                race.getBodyCounts(gc.RACE_SWORDSMAN, 500)
            );
            //console.log("defender", JSON.stringify(race.getBodyCounts(gc.RACE_SWORDSMAN, ec)));
            result500 = BattleQuickEstimate.quickCombat(
                [defender500],
                [invader],
                gc.MAX_SIM_BATTLE_LENGTH,
                false
            );
            //console.log("simulate combat result", result500);
            assert.strictEqual(result500.enemies.length, 0);
        });
    });

    describe("source Keeper", function() {
        it("simulate source keeper vrs keeper's bane", function() {
            //console.log("sourceKeeper", JSON.stringify(sourceKeeper));
            const keeperBane = race.bodyFromBodyCount(
                race.getBodyCounts(gc.RACE_PALADIN, 10000, 11)
            );
            const result = BattleQuickEstimate.quickCombat(
                [keeperBane],
                [bodies.sourceKeeper.body],
            );
            console.log("simulate combat result", JSON.stringify(result));
            assert(result.enemies.length === 0);
        });
        it("simulate source keeper vrs swordsman plus healer", function() {
            for (let ec = 800; ec <= 2300; ec += 500) {
                let swordsmanEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_SWORDSMAN, ec)
                );
                let healerEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_HEALER, ec)
                );
                resultEc = BattleQuickEstimate.quickCombat(
                    [swordsmanEC, healerEC],
                    [bodies.sourceKeeper.body],
                    gc.MAX_SIM_BATTLE_LENGTH,
                    false
                );
                console.log(ec, "friends", JSON.stringify(resultEc.friends),);
                console.log(ec, "enemies", JSON.stringify(resultEc.enemies),);
                //console.log(ec, "resultEc.friends === []",resultEc.friends,resultEc.friends === []);
                console.log("ec >= 1800",ec >= 1800, "resultEc.enemies.length",resultEc.enemies.length,"resultEc.friends.length", resultEc.friends.length);
                assert(ec >= 1800 ? resultEc.enemies.length === 0 : resultEc.friends.length === 0);
            }
        })

       // it("simulate combat", function() {
       //     const result = BattleQuickEstimate.quickCombat(
       //         [bodies.meleeRcl3],
       //         [bodies.swordsman]
       //     );
       //     //console.log("simulate combat result", JSON.stringify(result));
       //     assert(result.enemies === []);
    });
});