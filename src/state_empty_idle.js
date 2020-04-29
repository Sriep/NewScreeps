/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");
const race = require("race");

function State (creep) {
    if (!creep)
        return gf.fatalError("Create creep state with no creep object")
    this.type = gc.STATE_EMPTY_IDLE;
    this.creep = creep
}

State.prototype.enact = function () {
    switch (race.getRace(this.creep)) {
        case gc.RACE_PORTER:
            return state.switchState(this.creep, gc.STATE_PORTER_IDLE)
        case gc.RACE_WORKER:
        {
            const source = state.findTargetSource(this.creep.room)
            if (source) {
                return state.switchToMoveTarget(
                    this.creep,
                    source.id,
                    gc.RANGE_HARVEST,
                    gc.STATE_WORKER_HARVEST
                );
            }
            break;
        }
        case gc.RACE_HARVESTER:
            return state.switchState(this.creep, gc.STATE_HARVESTER_IDLE);

        default:
            console.log("race in STATE_EMPTY_IDLE", race.getRace(this.creep));//,"creep", JSON.stringify(this.creep));
            this.creep.say("help? do?");
    }

}

module.exports = State;