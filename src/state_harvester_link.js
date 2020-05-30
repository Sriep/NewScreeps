/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const state = require("state");
const FlagOwnedRoom = require("flag_owned_room");

function StateHarvesterLink (creep) {
    this.type = gc.STATE_HARVESTER_LINK;
    this.creep = creep
}

StateHarvesterLink.prototype.enact = function () {
    //console.log(this.creep.name, "STATE_HARVESTER_LINK");
    const fRoom = new FlagOwnedRoom(this.creep.room.name);
    const sourceLink = state.getObjAtPos(fRoom.sourceLinkPos(this.creep.memory.targetId), STRUCTURE_LINK);
    const controllerLink = state.getObjAtPos(fRoom.controllerLinkPos(), STRUCTURE_LINK);
    if (!sourceLink || !controllerLink) {
        if (state.spaceForHarvest(this.creep)) {
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_HARVESTER_HARVEST);
        } else {
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_HARVESTER_TRANSFER);
        }
    }

    const result = this.creep.transfer(link, RESOURCE_ENERGY);
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
            return;
        case ERR_NOT_IN_RANGE:          // The target is too far away.
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }

    const linkResult = sourceLink.transferEnergy(controllerLink);
    switch (linkResult) {
        case OK:
            break;
        case  ERR_NOT_OWNER:
            return gf.fatalError("transfer ERR_NOT_OWNER");
        case ERR_NOT_ENOUGH_RESOURCES:
            return gf.fatalError("transfer ERR_NOT_ENOUGH_RESOURCES");
        case ERR_INVALID_TARGET:
            return gf.fatalError("transfer ERR_INVALID_TARGET");
        case ERR_FULL:
            return;
        case ERR_NOT_IN_RANGE:
            return gf.fatalError("transfer ERR_NOT_IN_RANGE");
        case ERR_INVALID_ARGS:
            return gf.fatalError("transfer ERR_INVALID_ARGS");
        case ERR_TIRED:
            return gf.fatalError("transfer ERR_TIRED");
        case ERR_RCL_NOT_ENOUGH:
            return gf.fatalError("transfer ERR_INVAERR_RCL_NOT_ENOUGHLID_ARGS");
        default:
            return gf.fatalError("harvest unrecognised return value");
    }

};

module.exports = StateHarvesterLink;




















