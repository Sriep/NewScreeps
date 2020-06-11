/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const gf = require("./gf");
const state = require("./state");
const RoomFlag = require("./flag_room");
const StateCreep = require("./state_creep");

class StateHarvesterTransfer extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        console.log("STATE_HARVESTER_TRANSFER2", this.targetId);
        //console.log("STATE_HARVESTER_TRANSFER1", this.getM(this.M.TargetId));
       // if (this.spaceForHarvest(this.creep)) {
        //    return state.switchTo(this.creep, this.creep.memory, gc.STATE_HARVESTER_HARVEST)
        //}

        if (!this.targetId) {
            return state.switchTo(this.creep, this.memory, gc.STATE_HARVESTER_IDLE);
        }
        const fRoom = new RoomFlag(this.targetPos.roomName);
        const scPos = gf.roomPosFromPos(fRoom.getSourceContainerPos(this.targetId));
        const container = state.findContainerAt(scPos);
        if (!container) {
            return state.switchTo(this.creep, this.memory, gc.STATE_HARVESTER_BUILD)
        }

        if (container.hits < container.hitsMax * gc.CONTAINER_REPAIR_THRESHOLD) {
            return state.switchTo(this.creep, this.memory, gc.STATE_HARVESTER_REPAIR)
        }

        const result = this.creep.transfer(container, RESOURCE_ENERGY);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                return gf.fatalError("transfer ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                return gf.fatalError("transfer ERR_BUSY");
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                return ERR_NOT_ENOUGH_RESOURCES;
                //return gf.fatalError("transfer ERR_NOT_ENOUGH_RESOURCES");
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                return gf.fatalError("transfer ERR_INVALID_TARGET");
            case ERR_FULL:        // The extractor or the deposit is still cooling down.
                return;
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                return gf.fatalError("transfer ERR_NOT_IN_RANGE");
            case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
                return gf.fatalError("transfer ERR_INVALID_ARGS");
            default:
                return gf.fatalError("harvest unrecognised return value");
        }
        state.switchTo(this.creep, this.memory, gc.STATE_HARVESTER_HARVEST);
    };

}

module.exports = StateHarvesterTransfer;