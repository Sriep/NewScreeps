/**
 * @fileOverview screeps
 * Created by piers on 10/05/2020
 * @author Piers Shepperson
 */

const assert = require('assert');
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
    });
});