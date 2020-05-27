/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const assert = require('assert');
const tile = require("../src/tile");

describe("tile operations\"", function() {
    describe("shiftToOrigin", function() {
        it("should shift tile by origin", function() {
            const shift = 20;
            const centre = tile.getCopy(tile.CENTRE_6x6_1);
            const control = tile.getCopy(tile.CENTRE_6x6_1);
            centre["origin"] = {x:shift,y:shift};
            tile.shiftToOrigin(centre);
            let countValues = 0;
            for (let key in centre) {
                if (Array.isArray(centre[key])) {
                    for ( let i in centre[key]) {
                        assert.strictEqual(control[key][i].x, centre[key][i].x-shift);
                        assert.strictEqual(control[key][i].y, centre[key][i].y-shift);
                        countValues++
                    }
                }
            }
            assert.strictEqual(countValues, 37);
        });

    });
});