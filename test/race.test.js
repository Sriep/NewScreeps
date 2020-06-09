/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const C = require("../src/Constants");
const race = require("../src/race");


describe("race", function() {
    describe("getCostBody", function() {
        it("show the energy cost of some bodies", function() {
            const parts = Object.keys(C.BODYPART_COST);
            for (let part of parts) {
                for ( let i = 0 ; i <= 10 ; i++ ) {
                    const bodyparts = { [part]:i };
                    const cost = race.getCostBody(bodyparts);
                    assert.strictEqual(
                        cost,
                        C.BODYPART_COST[part]*i
                    )
                }
            }
        });
    });
});