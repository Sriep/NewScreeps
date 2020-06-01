/**
 * @fileOverview screeps
 * Created by piers on 29/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");

function StatePorterWithdraw (creep) {
    this.type = gc.STATE_PORTER_WITHDRAW;
    this.creep = creep;
    this.m = this.creep.memory
}

StatePorterWithdraw.prototype.enact = function () {
    if (this.creep.store.getFreeCapacity() === 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_FULL_IDLE);
    }

   //console.log(this.creep.name, "in STATE_PORTER_WITHDRAW this.creep.m", JSON.stringify(this.m));
    let target;
    if (this.m.targetPos) {
        target = this.getTarget(new RoomPosition(
            this.m.targetPos.x,
            this.m.targetPos.y,
            this.creep.room.name
        ))
    }

    if (!target) {
        if (this.creep.store.getUsedCapacity() > 0) {
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_FULL_IDLE);
        } else {
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_IDLE);
        }
    }

    const result = this.creep.withdraw(target.struct, target.resource);
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
            return gf.fatalError("transfer ERR_NOT_OWNER");
        case ERR_BUSY:                  // The creep is still being spawned.
            return gf.fatalError("transfer ERR_BUSY");
        case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_IDLE);
        case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
            return gf.fatalError("transfer ERR_INVALID_TARGET");
        case ERR_FULL:        // The extractor or the deposit is still cooling down.
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_FULL_IDLE);
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }
    delete this.creep.memory.next_state;
    if (this.creep.store.getUsedCapacity() > 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_FULL_IDLE);
    } else {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_IDLE);
    }

};

StatePorterWithdraw.prototype.getTarget = function(pos) {
    const StructAt = pos.lookFor(LOOK_STRUCTURES);
    for (let struct of StructAt) {
        switch(struct.structureType) {
            case STRUCTURE_CONTAINER:
            case STRUCTURE_STORAGE:
            case STRUCTURE_TERMINAL:
                return {struct: struct, resource: RESOURCE_ENERGY};
            case STRUCTURE_LINK:
                if (gf.loadFromFlag(struct)) {
                    return {struct: struct, resource: RESOURCE_ENERGY};
                }
                break;
            case STRUCTURE_LAB:
                const lFlag = Game.flags[lab.id];
                if (struct.mineralType !== lr.resource(lFlag.color, lFlag.secondaryColor)) {
                    return {struct: struct, resource: struct.mineralType};
                }
                break;
            default:
        }
    }
};

module.exports = StatePorterWithdraw;

































