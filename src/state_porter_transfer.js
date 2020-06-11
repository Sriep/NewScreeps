/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StatePorterTransfer extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name, "in STATE_PORTER_TRANSFER");
        if (this.creep.store.getUsedCapacity() === 0) {
            return this.switchTo( gc.STATE_PORTER_IDLE)
        }
        const target = Game.getObjectById(this.targetId);
        const resource = this.findTransferResource(target.store, this.creep.store);
        if (!resource) {
            return this.switchTo( gc.STATE_PORTER_FULL_IDLE);
        }

        const result = this.creep.transfer(target, resource);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                return gf.fatalError("transfer ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                return gf.fatalError("transfer ERR_BUSY");
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                return gf.fatalError("transfer ERR_NOT_ENOUGH_RESOURCES");
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                return gf.fatalError("transfer ERR_INVALID_TARGET");
            case ERR_FULL:        // The extractor or the deposit is still cooling down.
                return this.switchTo( gc.STATE_PORTER_FULL_IDLE);
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                return gf.fatalError("transfer ERR_NOT_IN_RANGE");
            case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
                return gf.fatalError("transfer ERR_INVALID_ARGS");
            default:
                return gf.fatalError("harvest unrecognised return value");
        }
    };

    findTransferResource(target, store) {
        if (target.structureType === STRUCTURE_LAB) {
            const lFlag = Game.flags[lab.id];
            const resource = lr.resource(lFlag.color, lFlag.secondaryColor);
            if (resource && store[resource] > 0) {
                return resource;
            }
            if (target.store.getFreeCapacity(RESOURCE_ENERGY) && store[RESOURCE_ENERGY] > 0) {
                return RESOURCE_ENERGY;
            }
            return;
        }

        for (let resource in store) {
            if (target.getFreeCapacity(resource) > 0 && store[resource] > 0) {
                return resource;
            }
        }
    };

}



module.exports = StatePorterTransfer;




















