/**
 * @fileOverview screeps
 * Created by piers on 02/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StateWorkerWithdraw extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name, "in STATE_WORKER_WITHDRAW")
        let target;
        if (this.targetId) {
            target = Game.getObjectById(this.targetId);
        }
        if (!target) {
            if (this.creep.store.getUsedCapacity()> 0) {
                return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
            } else {
                return this.switchTo( gc.STATE_WORKER_IDLE);
            }
        }

        const result = this.creep.withdraw(target, RESOURCE_ENERGY);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                return gf.fatalError("transfer ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                return gf.fatalError("transfer ERR_BUSY");
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                    return this.switchTo( gc.STATE_WORKER_IDLE);
                } else {
                    return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
                }
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                return gf.fatalError("transfer ERR_INVALID_TARGET");
            case ERR_FULL:        // The extractor or the deposit is still cooling down.
                return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY)> 0) {
                    return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
                } else {
                    return this.switchTo( gc.STATE_WORKER_IDLE);
                }
            case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
                return gf.fatalError("transfer ERR_INVALID_ARGS");
            default:
                return gf.fatalError("harvest unrecognised return value");
        }
        if (this.creep.store.getUsedCapacity() === 0) {
            return this.switchTo( gc.STATE_WORKER_IDLE);
        }
        this.switchTo( gc.STATE_WORKER_FULL_IDLE);
    };
}



module.exports = StateWorkerWithdraw;