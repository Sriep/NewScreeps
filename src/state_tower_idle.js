/**
 * @fileOverview screeps
 * Created by piers on 17/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");

function State (structure) {
    this.type = gc.STATE_TOWER_IDLE;
    this.tower = structure;
}

State.prototype.enact = function () {
    if (this.tower.pos.find(FIND_HOSTILE_CREEPS) > 0) {
        state.switchTo(this.tower, gc.STATE_TOWER_DEFEND)
    }

    let damagedStructure = this.tower.pos.find(FIND_MY_STRUCTURES, {
        filter: (s) =>  { return this.tower.pos.inRangeTo(s.pos)
            && s.hits < s.hitsMax * gc.TOWER_REPAIR_THRESHOLD
            && s.structureType !== STRUCTURE_WALL
            && s.structureType !== STRUCTURE_RAMPART
        }
    });
    if (damagedStructure.length > 0) {
        this.tower.repair(damagedStructure[0]);
    }
};

module.exports = State;