/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const StateCreep = require("./state_creep");

class StateSpawning extends StateCreep {
    constructor(creep) {
        super(creep)
    }

    enact() {
        if (this.creep.spawning) {
            return;
        }
        this.switchTo(this.nextState)
    };
}

module.exports = StateSpawning;