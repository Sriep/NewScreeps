/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const race_porter = require("../src/race_porter");

describe("race_porter", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {

            for (let ec = 0 ; ec <= 3000 ; ec+=100 ) {
                const body = race_porter.bodyCounts(ec);
                const bodySlow = race_porter.bodyCounts(ec, true);
                //console.log(ec,"fast", JSON.stringify(body), "slow", JSON.stringify(bodySlow));
                assert.strictEqual(body["carry"], body["move"]);
                if (ec >=200) {
                    assert.strictEqual(bodySlow["carry"], 2*bodySlow["move"]);
                }
                if (ec >=2500) {
                    assert.strictEqual(25, body["carry"]);
                    assert.strictEqual(32, bodySlow["carry"]);

                } else {
                    assert.strictEqual(ec/100, body["carry"]);
                }
            }

        });
    });
});