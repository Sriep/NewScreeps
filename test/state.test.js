/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
//const cache = require("../src/cache");
//const C = require("../src/Constants");
const state = require("../src/state");
const RoomPosition = require("./mocks/room_position");
const paths = require("./mocks/paths");

describe("state", function() {
    describe("piers", function() {
        it("piers", function() {
            const creep = { memory : {
                state: gc.STATE_SCOUT_IDLE
            }};
            state.enactCreep(creep, creep.memory);
            cosole.log("creep", JSON.stringify(creep));

        });
    });

    describe("findTargetOnPath", function() {
        it("should find the closets point on path", function() {
            const myPos = new RoomPosition(6,8,"W8N7");
            let index68 = state.indexClosestApproachToPath(myPos, paths.sPathW8N7);
            //console.log("index68", index68);
            assert.strictEqual(index68, 1);

            const pos136 = new RoomPosition(13,6,"W8N7");
            const index136 = state.indexClosestApproachToPath(pos136, paths.sPathW8N7);
            //console.log("index2", index136, "pos");
            assert.strictEqual(index136, 7);

            const pos4949 = new RoomPosition(49,49,"W8N7");
            const index4949 = state.indexClosestApproachToPath(pos4949, paths.sPathW8N7);
            assert.strictEqual(index4949, 22);
            //console.log("index3", index4949);

        });
    });

    describe("findTargetOnPath", function() {
        it("should find the index of point", function() {

            const pos3314 = new RoomPosition(33,14,"W8N7");
            let index3314 = state.findIndexPos(pos3314, paths.sPathW8N7, 0,false);
            //console.log("index3314", index3314);
            assert.strictEqual(index3314, 28);

            const pos68 = new RoomPosition(6,8,"W8N7");
            let index68 = state.findIndexPos(pos68, paths.sPathW8N7, 0,false);
            //console.log("index68", index68);
            assert.strictEqual(index68, undefined);

            const pos415 = new RoomPosition(4,15,"W7N7");
            const index415 = state.findIndexPos(pos415, paths.sPathW8N7, 0,true);
            //console.log("index415", index415);
            assert.strictEqual(index415, 49);



        });
    });
});