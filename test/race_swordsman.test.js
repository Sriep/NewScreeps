/**
 * @fileOverview screeps
 * Created by piers on 10/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
const C = require("../src/Constants");
const assert = require("assert");
const race = require("../src/race");
const race_swordsman = require("../src/race_swordsman");

describe("race_swordsman", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {
            for (let ec = 0 ; ec <= 10000 ; ec+=100 ) {
                const body = race_swordsman.bodyCounts(ec);
                const toughBody = race_swordsman.bodyCounts(ec, true);
                //console.log(ec, "body", JSON.stringify(body), "toughBody", JSON.stringify(toughBody));
                assert(body[C.MOVE] === body[C.TOUGH] + body[C.ATTACK]);
                //assert(body[C.TOUGH] >= body[C.ATTACK]);
            }
            assert(!race.isCivilian({
                name: gc.RACE_SWORDSMAN + "_" + "200" + "_568",
            }))

        });
    });
});