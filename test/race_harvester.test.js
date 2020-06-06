/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const assert = require('assert');
const race_harvester = require("../src/race_harvester");

describe("race_harvester", function() {
    describe("bodyCounts", function() {
        it("should show body counts for energy", function() {
            const counts200 = race_harvester.bodyCounts(200);
            assert.strictEqual(counts200, undefined, "ec = 200");
            const counts300 = race_harvester.bodyCounts(300);
            assert.strictEqual(counts300["work"], 2);
            assert.strictEqual(counts300["carry"], 1);
            assert.strictEqual(counts300["move"], 1);
            const counts550 = race_harvester.bodyCounts(550);
            assert.strictEqual(counts550["work"], 4);
            assert.strictEqual(counts550["carry"], 1);
            assert.strictEqual(counts550["move"], 2);
            const counts800 = race_harvester.bodyCounts(800);
            assert.strictEqual(counts800["work"], 5);
            assert.strictEqual(counts800["carry"], 1);
            assert.strictEqual(counts800["move"], 5);
            const counts2000 = race_harvester.bodyCounts(2000);
            assert.strictEqual(counts800, counts2000);

            //for (let ec = 300 ; ec <= 3000 ; ec+=100 ) {
                //const body = race_harvester.bodyCounts(ec);
                //const body2 = race_harvester.bodyCounts(ec, true);
                //console.log(ec,"\tbody\t","static\t", JSON.stringify(body));
                //console.log(ec,"\tbody\t","flexi\t", JSON.stringify(body2));
                //asconsole.log("ec",ec,"body", JSON.stringify(body));sert.strictEqual(body["carry"], body["move"]);
                //if (ec >=2500) {
                    //assert.strictEqual(25, body["move"]);
                //} else {
                    //assert.strictEqual(ec/100, body["move"]);
                //}
            //}
        });
    });
});