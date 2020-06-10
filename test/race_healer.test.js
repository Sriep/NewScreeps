/**
 * @fileOverview screeps
 * Created by piers on 10/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
const C = require("../src/Constants");
const assert = require("assert");
const race = require("../src/race");
const race_healer = require("../src/race_healer");

describe("race_healer", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {
            for (let ec = 0 ; ec <= 10000 ; ec+=100 ) {
                const body = race_healer.bodyCounts(ec);
                //console.log(ec, "body", JSON.stringify(body));
                assert(body[C.MOVE] === body[C.TOUGH] + body[C.HEAL]);
                assert(body[C.TOUGH] >= body[C.HEAL]);
            }
            assert(!race.isCivilian({
                name: gc.RACE_HEALER + "_" + "600" + "_568",
            }))

        });
    });
});