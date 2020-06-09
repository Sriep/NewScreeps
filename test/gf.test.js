/**
 * @fileOverview screeps
 * Created by piers on 10/05/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
//const C = require("../src/Constants");
//const gc = require("../src/gc");
const gf = require("../src/gf");

describe("gf", function() {
    describe("splitRoomName", function() {
        it("should split a room name into NSEW and x,y coordinates", function() {
            const split = gf.splitRoomName("W7N8");
            assert.strictEqual(split.EW, "W");
            assert.strictEqual(split.NS, "N");
            assert.strictEqual(split.x, 7);
            assert.strictEqual(split.y, 8);
        });
        it ("should recognise room names", function() {
            assert(gf.validateRoomName("W7N7"));
            assert(!gf.validateRoomName("the quick brown fox"));
            assert(!gf.validateRoomName("N7W7"));
            assert(gf.validateRoomName("E457S117"));
            assert(gf.validateRoomName("E7N17"));
            assert(gf.validateRoomName("W3S0"));
            assert(!gf.validateRoomName("W-3S0"));
        })
    });
});

