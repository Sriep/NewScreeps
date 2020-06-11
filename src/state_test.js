/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */

const StateCreep = require("./state_creep");

class StateTest  extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        this.moveRange = this.moveRange ? this.moveRange + 3 : 2;
        this.switchTo("test")
    };
}

module.exports = StateTest;