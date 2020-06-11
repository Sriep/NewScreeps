/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const state = require("state");
const stateUpgrader = require("state_upgrader");
const FlagOwnedRoom = require("flag_owned_room");

class StateUpgraderWithdraw {
    constructor(creep) {
        this.type = gc.STATE_UPGRADER_WITHDRAW;
        this.creep = creep;
        this.m = this.creep.memory
    }

    enact() {
        //console.log(this.creep.name, "STATE_UPGRADER_WITHDRAW");

        //
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_UPGRADER_UPGRADE)
        }
        const fRoom = new FlagOwnedRoom(this.creep.room.name);
        const cLinkPos = fRoom.controllerLinkPos();
        if (cLinkPos) {
            const controllerLink = state.getObjAtPos(cLinkPos, STRUCTURE_LINK);
            if (controllerLink) {
                if (this.creep.pos.isNearTo(controllerLink)) {
                    if (controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                        const result = this.creep.pos.withdraw(controllerLink, RESOURCE_ENERGY);
                        if (result === OK) {
                            state.switchTo(this.creep, this.creep.memory, gc.STATE_UPGRADER_UPGRADE)
                        }
                    }
                }
            }
        }

        const container = stateUpgrader.findUpgradeContainerNear(this.creep);
        if (!container) {
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_UPGRADER_IDLE)
        }

        if (container.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            return;
        }

        const result = this.creep.withdraw(container, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                break;
            case  ERR_NOT_OWNER:
                return gf.fatalError("transfer ERR_NOT_OWNER");
            case ERR_BUSY:
                return gf.fatalError("transfer ERR_BUSY");
            case ERR_NOT_ENOUGH_RESOURCES:           // upgraders' bucket is empty
                return state.switchTo(this.creep, this.creep.memory, gc.STATE_UPGRADER_IDLE);
            case ERR_INVALID_TARGET:
                return gf.fatalError("transfer ERR_INVALID_TARGET");
            case ERR_FULL:
                return state.switchToFullIdle();
            case ERR_NOT_IN_RANGE:
                return gf.fatalError("transfer ERR_NOT_IN_RANGE");
            case ERR_INVALID_ARGS:
                return gf.fatalError("transfer ERR_INVALID_ARGS");
            default:
                return gf.fatalError("harvest unrecognised return value");
        }
    };

}



module.exports = StateUpgraderWithdraw;