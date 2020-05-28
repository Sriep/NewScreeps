/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const assert = require('assert');
const race_porter = require("../src/race_porter");

describe("race_porter", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {

            for (let ec = 0 ; ec <= 3000 ; ec+=100 ) {
                const body = race_porter.bodyCounts(ec);
                assert.strictEqual(body["carry"], body["move"]);
                if (ec >=2500) {
                    assert.strictEqual(25, body["move"]);
                } else {
                    assert.strictEqual(ec/100, body["move"]);
                }
            }

        });
    });
});