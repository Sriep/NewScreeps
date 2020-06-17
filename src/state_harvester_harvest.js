/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const state = require("state");
const StateCreep = require("./state_creep");

class StateHarvesterHarvest extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name, "STATE_HARVESTER_HARVEST dPath", JSON.stringify(cache.deserialisePath(this.m.path)));
        //console.log(this.creep.name, "STATE_HARVESTER_HARVEST store", JSON.stringify(this.creep.store));
        if (!state.spaceForHarvest(this.creep)) {
            //console.log(this.creep.name,"STATE_HARVESTER_HARVEST no space",this.creep.store);
            return this.switchTo( gc.STATE_HARVESTER_TRANSFER);
        }
        const source = Game.getObjectById(this.targetId);

        const result = this.creep.harvest(source);
        //console.log(this.creep.name,"StateHarvesterHarvest result", result, "sourec id", source.id);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this creep, or the room controller is owned or reserved by another player..
                return gf.fatalError(this.creep.name,"ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                return gf.fatalError(this.creep.name,"ERR_BUSY");
            case ERR_NOT_FOUND:     // Extractor not found. You must build an extractor structure to harvest minerals. Learn more.
                return gf.fatalError(this.creep.name,"ERR_NOT_FOUND");
            case ERR_NOT_ENOUGH_RESOURCES:          // The target does not contain any harvestable energy or mineral..
                return ERR_NOT_ENOUGH_RESOURCES;
            //return gf.fatalError("ERR_NOT_ENOUGH_RESOURCES");
            case ERR_INVALID_TARGET:        // 	The target is not a valid source or mineral object
                console.log(this.creep.name,"pos", this.creep.pos,"target id", this.targetId,"target", source);
                return gf.fatalError(this.creep.name,"ERR_INVALID_TARGET");
            case ERR_NOT_IN_RANGE:          // The target is too far away.
                console.log(this.creep.name,"STATE_HARVESTER_HARVEST pos",
                    JSON.stringify(this.creep.pos), "source pos", source.pos, "sourceid", source.id, "type", source.type);
                 return gf.fatalError(this.creep.name,"ERR_NOT_IN_RANGE");
            case ERR_TIRED:        // The extractor or the deposit is still cooling down.
                return ERR_TIRED;
            case ERR_NO_BODYPART:        // There are no WORK body parts in this creep’s body.
                return gf.fatalError(this.creep.name, "ERR_NO_BODYPART");
            default:
                throw("harvest unrecognised return value");
        }
    };

}



module.exports = StateHarvesterHarvest;