/**
 * @fileOverview screeps
 * Created by piers on 11/06/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StateSwordsmanIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        const target = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (target) {
            this.creep.moveTo(target);
            this.creep.attack(target);
        } else {
            this.switchTo(gc.STATE_PATROL)
        }
    };
}

module.exports = StateSwordsmanIdle;