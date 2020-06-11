/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");

class StateBoostCreep{
    constructor(creep) {
        this.type = gc.STATE_FIND_BOOST;
        this.creep = creep;
        this.m = this.creep.memory;
    }

    enact() {
        const raceModule = require("race_" + race.getRace(this.creep));
        const labs = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter: lab => {
                return lab.structureType === STRUCTURE_LAB
                    && lab.pos.isNearTo(this.creep.pos)
            }
        });
        for (let boost of raceModule.boosts) {
            if (!race.creepBoosted(this.creep, boost.resource)) {
                for (let lab of labs) {
                    if (lab.mineralType === boost.resource) {
                        lab.boostCreep(this.creep);
                        return state.switchTo(this.creep, this.m, gc.STATE_FIND_BOOST)
                    }
                }
            }
        }
        state.switchTo(this.creep, this.creep.memory, race.getRace(this.creep) + "_idle")
    };
}

module.exports = StateBoostCreep;