/**
 * @fileOverview screeps
 * Created by piers on 17/05/2020
 * @author Piers Shepperson
 */
//const C = require("./Constants");
const gc = require("gc");

class StateTowerIdle {
    constructor(structure) {
        this.type = gc.STATE_TERMINAL_IDLE;
        this.lab = structure;
    }

    enac() {

    };
}

module.exports = StateTowerIdle;
