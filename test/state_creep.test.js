/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const CreepMemory = require("../src/creep_memory");
const state = require("../src/state");

describe("creep_memory", function() {
    describe("CreepMemory properties", function() {
        it("check state recuse depth", function() {
            const creep = { memory : {} };
            CreepMemory.M(creep).state = "test";
            state.enactCreep(creep);
            //console.log("creep", JSON.stringify(creep, "", "\t"))
            //console.log("creep range", CreepMemory.M(creep).moveRange)
            assert.strictEqual(CreepMemory.M(creep).moveRange, 2+3*gc.MAX_STATE_STACK);


        });
    });
});