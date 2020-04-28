/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_HARVESTER_BUILD;
    this.creep = creep
}

State.prototype.enact = function () {
    if (state.spaceForHarvest(creep)) {
        state.switchState(creep, gc.STATE_HARVEST);
    }

    if (state.isBuilt(this.creep.memory.site.pos)) {
        state.switchState(creep, gc.STATE_HARVESTER_TRANSFER);
    }

    let site = undefined;
    if (this.creep.memory.constructionId) {
        site = Game.getObjectById(this.creep.memory.siteId)
    }
    if (!site) {
        site = state.findContainerConstructionNear(creep, 1);
    }
    if (!site) {
        const result = this.creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
        if (result === OK) {
            sitesAtPos = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)
            site = sitesAtPos[0]
            const sourceFlag =  Games.Flags[creep.memory.targetId];
            sourceFlag.memory.container = this.creep.pos;
        } else {
            return gf.fatalError("Help cant start harvester consturction error " + result.toString());
        }
    }
    this.creep.memory.siteId = site.id;
    this.creep.memory.sitePos = site.pos;

    const result = this.creep.build(site);
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
            return gf.fatalError("ERR_NOT_IN_RANGE");
        case ERR_NO_BODYPART:        // There are no WORK body parts in this creep’s body.
            return gf.fatalError("ERR_NO_BODYPART");
        default:
            return gf.fatalError("no valid result");
    }
}

module.exports = State;