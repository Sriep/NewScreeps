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
                [JSON.parse(JSON.stringify(invader))],
                gc.MAX_SIM_BATTLE_LENGTH,
                false
            );
            //console.log("simulate combat result", result300);
            assert.strictEqual(result300.friends.length, 0);

//
            defender500 = race.bodyFromBodyCount(
                race.getBodyCounts(gc.RACE_SWORDSMAN, 500)
            );
            //console.log("defender", JSON.stringify(race.getBodyCounts(gc.RACE_SWORDSMAN, ec)));
            result500 = BattleQuickEstimate.quickCombat(
                [defender500],
                [JSON.parse(JSON.stringify(invader))],
                gc.MAX_SIM_BATTLE_LENGTH,
                false
            );
            //console.log("simulate combat result", result500);
            assert.strictEqual(result500.enemies.length, 0);
        });
    });

    describe("source Keeper", function() {

        it("simulate source keeper vrs keeper's bane", function() {
            for (let ec = 1000; ec <= 6000; ec += 500) {
                //console.log("sourceKeeper", JSON.stringify(sourceKeeper));
                const keeperBane = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_PALADIN, ec, 11)
                );
                const resultEc = BattleQuickEstimate.quickCombat(
                    [keeperBane],
                    [JSON.parse(JSON.stringify(bodies.sourceKeeper.body))],
                    gc.MAX_SIM_BATTLE_LENGTH,
                    false
                );
                //console.log(ec, "1 lengths friends", resultEc.friends.length, "enemies", resultEc.enemies.length);
                assert(ec >= 6000 ? resultEc.enemies.length === 0 : resultEc.friends.length === 0);
            }

        });

        it("simulate source keeper vrs two creeps", function() {
            for (let ec = 800; ec <= 2300; ec += 500) {
                let swordsmanEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_SWORDSMAN, ec)
                );
                let healerEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_HEALER, ec)
                );
                resultEc = BattleQuickEstimate.quickCombat(
                    [swordsmanEC, healerEC],
                    [JSON.parse(JSON.stringify(bodies.sourceKeeper.body))],
                    gc.MAX_SIM_BATTLE_LENGTH,
                    false
                );
                //console.log(ec, "3 lengths friends", resultEc.friends.length, "enemies", resultEc.enemies.length);
                assert(ec >= 2300 ? resultEc.enemies.length === 0 : resultEc.friends.length === 0);
            }
        });

        it("simulate source keeper vrs three creeps", function() {
            for (let ec = 300; ec <= 1800; ec += 250) {
                let swordsmanEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_SWORDSMAN, ec)
                );
                let healerEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_HEALER, ec)
                );
                //const sourceKeeperBody = Object.assign({}, bodies.sourceKeeper.body);
                resultEc = BattleQuickEstimate.quickCombat(
                    [swordsmanEC, healerEC, swordsmanEC],
                     [JSON.parse(JSON.stringify(bodies.sourceKeeper.body))],
                    gc.MAX_SIM_BATTLE_LENGTH,
                    false
                );
                //console.log(ec, "3 lengths friends", resultEc.friends.length, "enemies", resultEc.enemies.length);
                assert(ec >= 1550 ? resultEc.enemies.length === 0 : resultEc.friends.length < 3);
            }
        });

        it("simulate source keeper vrs four creeps", function() {
            for (let ec = 300; ec <= 1800; ec += 250) {
                let swordsmanEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_SWORDSMAN, ec, )
                );
                let healerEC = race.bodyFromBodyCount(
                    race.getBodyCounts(gc.RACE_HEALER, ec)
                );
                resultEc = BattleQuickEstimate.quickCombat(
                    [swordsmanEC, swordsmanEC, healerEC, healerEC],
                    [bodies.sourceKeeper.body],
                    gc.MAX_SIM_BATTLE_LENGTH,
                    false
                );
                //console.log(ec, "4 lengths friends", resultEc.friends.length, "enemies", resultEc.enemies.length);
                assert(ec >= 1550 ? resultEc.enemies.length === 0 : resultEc.friends.length < 4);
            }

        })
    });
});