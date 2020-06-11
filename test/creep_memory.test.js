/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const C = require("../src/Constants");
const CreepMemory = require("../src/creep_memory");
const cache = require("../src/cache");

describe("creep_memory", function() {
    describe("CreepMemory properties", function() {
        it("show setting and retrievingt properties", function() {
            const creep = {
                memory : {}
            };
            const properties = {
                //home
                state : "state_creep_idle",
                policyId : 1,
                targetPos : {x:25, y: 30, roomName : "W3N9" },
                targetId : "1234567890",
                targetName : "Fred",
                moveRange : 5,
                nextState : "state_creep_full",
                path : cache.serialisePath([{x: 25, y:25},{x:25, y:24}]),
                pathName : "my path",
                pathTargetPos : { x:7, y:32, roomName : "W1N9"},
                pathRange : 2,
                pathNextState : "state_creep_do_stuff",
                pathId : "0987654321",
                previousState : "state_creep_do_other_stuff",
                previousPos : {x:11, y:22, roomName : "E80X123"},
                direction : C.TOP,
                nextRoom : "E32S101",

            };
            const creepM = new CreepMemory(creep);
            for (let property in properties) {
                creepM[property] = properties[property]
            }
            for (let property in properties) {
                //console.log("expected", properties[property],"actual", creepM[property]);
                assert.strictEqual(JSON.stringify(creepM[property]), JSON.stringify(properties[property]))
            }
        });
    });
});