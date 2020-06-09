/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const race_porter = require("../src/race_upgrader");

describe("race_porter", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {

            for (let ec = 0 ; ec <= 5000 ; ec+=100 ) {
                const body = race_porter.bodyCounts(ec);
                //console.log("ec",ec,"body",JSON.stringify(body))
                //assert.strictEqual(Math.body["carry"]/2, body["nove"],);
            }

        });
    });
});