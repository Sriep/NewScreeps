/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StateWorkerRepair  extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name,"STATE_WORKER_REPAIR")
        if (this.creep.store.getUsedCapacity() === 0) {
            return this.switchTo( gc.STATE_WORKER_IDLE);
        }
        const target = Game.getObjectById(this.targetId);
        if (!target) {
            return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
        }
        if (target.hits === target.hitsMax) {
            return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
        }

        const result = this.creep.repair(target);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                return gf.fatalError("ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                return gf.fatalError("ERR_BUSY");
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                return gf.fatalError("ERR_NOT_ENOUGH_RESOURCES");
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                return gf.fatalError("ERR_INVALID_TARGET");
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
            // return gf.fatalError("ERR_NOT_IN_RANGE");
            case ERR_NO_BODYPART:        // There are no WORK body parts in this creep’s body.
                return gf.fatalError("ERR_NO_BODYPART");
            default:
                return gf.fatalError("no valid result");
        }
        if (target.hits === target.hitsMax) {
            return this.switchTo( gc.STATE_WORKER_FULL_IDLE)
        }
    };
}

module.exports = StateWorkerRepair;