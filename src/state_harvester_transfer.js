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
        if (this.creep.store.getUsedCapacity() === 0) {
            return this.switchTo(gc.STATE_HARVESTER_HARVEST)
        }

        //console.log(this.creep.name,"STATE_HARVESTER_TRANSFER2", this.targetId);
        if (!this.targetId) {
            return this.switchTo( gc.STATE_HARVESTER_IDLE);
        }
        const fRoom = new RoomFlag(this.targetPos.roomName);
        const scPos = gf.roomPosFromPos(fRoom.getSourceContainerPos(this.targetId));
        const container = state.findContainerAt(scPos);
        if (!container) {
            //console.log(this.creep.name,"StateHarvesterTransfer switch harvest build")
            return this.switchTo(gc.STATE_HARVESTER_BUILD)
        }

        if (container.hits < container.hitsMax * gc.CONTAINER_REPAIR_THRESHOLD) {
            //console.log(this.creep.name,"StateHarvesterTransfer switch harvest reapair");
            return this.switchTo( gc.STATE_HARVESTER_REPAIR)
        }
        //console.log(this.creep.name, "creep store",JSON.stringify(this.creep.store));
        //console.log(this.creep.name,"StateHarvesterTransfer transfer containertype",container.structureType, "store",JSON.stringify(container.store));
        const result = this.creep.transfer(container, RESOURCE_ENERGY);
        //console.log("harvest result",result);
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
        this.switchTo(gc.STATE_HARVESTER_HARVEST);
    };

}

module.exports = StateHarvesterTransfer;