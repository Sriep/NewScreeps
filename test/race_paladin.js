/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const C = require("../src/Constants");
const assert = require("assert");
const race = require("../src/race");
const race_paladin = require("../src/race_paladin");

describe("race_porter", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {
            for (let ec = 1 ; ec <= 10000 ; ec+=100 ) {
                const body = race_paladin.bodyCounts(ec);
                //console.log(ec, "body", JSON.stringify(body));
                if (ec >= race_paladin.MIN_EC) {
                    assert(body[C.MOVE] === body[C.HEAL] + body[C.ATTACK]);
                }
            }
            assert(!race.isCivilian({
                name: gc.RACE_PALADIN + "_" + race_paladin.MIN_EC.toString() + "_568",
            }))

        });
    });
});