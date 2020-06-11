/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");
const StateCreep = require("./state_creep");

class StateFindBoost  extends StateCreep {
    constructor(creep) {
        super(creep)
    }

    enact() {
        const raceModule = require("race_" + race.getRace(this.creep));
        const labs = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter: lab => {
                return lab.structureType === STRUCTURE_LAB
            }
        });
        for (let boost of raceModule.boosts) {
            if (!race.creepBoosted(this.creep, boost.resource)) {
                for (let lab of labs) {
                    if (lab.mineralType === boost.resource) {
                        state.switchToMovePos(
                            this.creep,
                            lab.pos,
                            gc.RANGE_BOOST,
                            gc.STATE_BOOST_CREEP,
                        );
                    }
                }
            }
        }
        state.switchTo(this.creep, this.creep.memory, race.getRace(this.creep) + "_idle")
    };

}

module.exports = StateFindBoost;