/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const StateCreep = require("./state_creep");

class StateBoostCreep extends StateCreep {
    constructor(creep) {
        super(creep)
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
                        return this.switchTo(gc.STATE_FIND_BOOST)
                    }
                }
            }
        }
        this.switchTo(race.getRace(this.creep) + "_idle")
    };
}

module.exports = StateBoostCreep;