/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
//const assert = require('assert');
//const C = require("../src/Constants");
const flag = require("../src/flag");
//const gf = require("../src/gf");
const FlagOwnedRoom = require("../src/flag_owned_room");

describe("flag_room_owned", function() {
    before(function() {
    });

    describe("value", function() {
        it("should value a room", function() {
            const roomFlag = {
                memory: {}
            };
            flag.getRoomFlag = function() { return roomFlag };
            const fRoom = new FlagOwnedRoom("test room");
            //console.log("fRoom", JSON.stringify(fRoom));
        });
    });
});


































