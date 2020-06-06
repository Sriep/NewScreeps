/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const assert = require('assert');
const gc = require('../src/gc');
const tile = require("../src/tile");

describe("tile operations\"", function() {
    describe("shiftToOrigin", function() {
        it("should shift tile by origin", function() {
            const shift = 20;
            const centreTile = tile.centres["CENTRE_6x6_1"];
            const centre = tile.getCopy(centreTile);
            const control = tile.getCopy(centreTile);
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
    describe("lab_map", function() {
        it("lab map should correctly show labs withing two moves", function() {
            const centreTile = tile.centres["CENTRE_6x6_3"];
            const centre = tile.getCopy(centreTile);
            let count = 0;
            for (let i = 0 ; i < 10 ; i++) {
                for (let j of centre.lab_map[i]) {
                    //console.log("pt",JSON.stringify(pt), "withinTwoMoves", JSON.stringify(withinTwoMoves));
                    assert(withinTwoMoves(centre.lab[j], centre.lab[i]));
                    count++
                }
            }
            assert(count, 70);
            for (let i = 0 ; i < 10 ; i++ ){
                for (let j = 0 ; j < 10 ; j++ ){
                    if (i !== j) {
                        if (withinTwoMoves(centre.lab[j], centre.lab[i])) {
                            assert(centre.lab_map[i].includes(j))
                        }
                        count++
                    }
                }
            }
            assert(count, 160);
        });
    });
});

function withinTwoMoves(p1, p2) {
    for (let xy of gc.TWO_MOVES) {
        if (p1.x-p2.x === xy.x && p1.y-p2.y === xy.y) {
            return true;
        }
    }
    return false;
}