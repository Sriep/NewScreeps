/**
 * @fileOverview screeps
 * Created by piers on 17/05/2020
 * @author Piers Shepperson
 */
//const C = require("./Constants");
const StateBuilding = require("state_building");

class StateTowerIdle extends StateBuilding {
    constructor(structure) {
        super(structure);
        //this.terminal = structure;
    }

    enact() {

    };
}

module.exports = StateTowerIdle;
