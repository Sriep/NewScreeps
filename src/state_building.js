/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");

class StateBuilding {
    constructor(building) {
        this.building = building
    }

    enactState() {
        if (this.stackDepth && this.stackDepth >= gc.MAX_STATE_STACK) {
            return;
        }
        if (!this.state) {
            return gf.fatalError("error! creep",JSON.stringify(this.creep), "with no state ", JSON.stringify(this.memory));
        }
        const requireString = "./state_" + this.state;
        const StateConstructor = require(requireString);
        const creepState = new StateConstructor(this.building);
        creepState.stackDepth = this.stackDepth ? this.stackDepth+1 : 1;
        creepState.enact();
    }

    switchTo(newState, targetId) {
        if (!newState || newState === "undefined_idle") {
            gf.fatalError(" no state to change to, targetId ", targetId, "memory", JSON.stringify(m));
        }
        if (targetId) {
            this.targetId = targetId;
        }
        this.state = newState;
        return this.enactState();
    }

}

module.exports = StateBuilding;