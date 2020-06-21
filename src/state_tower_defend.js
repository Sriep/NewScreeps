/**
 * @fileOverview screeps
 * Created by piers on 17/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const StateBuilding = require("state_building");

class StateTowerDefend extends StateBuilding {
    constructor(structure) {
        super(structure);
        this.tower = structure;
    }

    enact() {
        if (this.tower.room.find(FIND_HOSTILE_CREEPS).length === 0) {
            return state.switchTo(this.tower,  gc.STATE_TOWER_IDLE)
        }
        if (this.tower.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            return
        }
        const target = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        this.tower.attack(target);
    };
}



module.exports = StateTowerDefend;