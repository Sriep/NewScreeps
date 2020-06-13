/**
 * @fileOverview screeps
 * Created by piers on 11/06/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StatePatrol extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {

    };
}

module.exports = StatePatrol;