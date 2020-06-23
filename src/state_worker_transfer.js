/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StateWorkerTransfer extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name, "in STATE_WORKER_TRANSFER");
        if (this.creep.store.getUsedCapacity() === 0) {
            //console.log(this.creep.name, "in STATE_WORKER_TRANSFER this.creep.store.getUsedCapacity",this.creep.store.getUsedCapacity(RESOURCE_ENERGY)  );
            return this.switchTo( gc.STATE_WORKER_IDLE)
        }
        const target = Game.getObjectById(this.targetId);
        if (!target){//} || !target.store.getFreeCapacity(RESOURCE_ENERGY)) {
            //console.log(this.creep.name, "in STATE_WORKER_TRANSFER target",
            //    target, "target.store.getFreeCapacity", target.store.getFreeCapacity(RESOURCE_ENERGY))
            if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY> 0)) {
                return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
            } else {
                return this.switchTo( gc.STATE_WORKER_IDLE);
            }
        }

        const result = this.creep.transfer(target, RESOURCE_ENERGY);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                //console.log(this.creep.name, "in STATE_WORKER_TRANSFER OK", OK);
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                console.log("STATE_WORKER_TRANSFER result", result);
                return gf.fatalError("transfer ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                console.log("STATE_WORKER_TRANSFER result", result);
                return gf.fatalError("transfer ERR_BUSY");
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                console.log("STATE_WORKER_TRANSFER result", result);
                return gf.fatalError("transfer ERR_NOT_ENOUGH_RESOURCES");
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                console.log(this.creep.name,"STATE_WORKER_TRANSFER");
                console.log("ERR_INVALID_TARGET target", target.structureType,"target",JSON.stringify(target));
                console.log("STATE_WORKER_TRANSFER result", result);
                return gf.fatalError("transfer ERR_INVALID_TARGET");
            case ERR_FULL:        // The extractor or the deposit is still cooling down.
                //console.log("STATE_WORKER_TRANSFER result", result);
                //console.log(this.creep.name, "creeps store", this.creep.store, "target store", JSON.stringify(target.store));
                return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                //console.log("STATE_WORKER_TRANSFER result", result);
                return this.switchTo( gc.STATE_WORKER_FULL_IDLE); // todo why is this happening
            //return gf.fatalError("transfer ERR_NOT_IN_RANGE");
            case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
                //console.log("STATE_WORKER_TRANSFER result", result);
                return gf.fatalError("transfer ERR_INVALID_ARGS");
            default:
                return gf.fatalError("harvest unrecognised return value");
        }
        if (target.store.getUsedCapacity() === 0) {
            return this.switchTo( gc.STATE_WORKER_IDLE);
        }
    };
}



module.exports = StateWorkerTransfer;