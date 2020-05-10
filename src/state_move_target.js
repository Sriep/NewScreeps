/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
const race = require("race");

//depreciated, use STATE_MOVE_POSITION instead
function State (creep) {
    this.type = gc.STATE_MOVE_TARGET;
    this.creep = creep
}

State.prototype.enact = function () {
    //const target = Game.getObjectById(this.creep.memory.targetId);
    const flag = Game.flags[this.creep.memory.targetName];
    //console.log("STATE_MOVE_TARGET, flag pos", JSON.stringify(flag.pos), "flag name", flag.name);
    if (!flag) {
        return state.switchTo(this.creep, race.getRace(this.creep) + "_idle");
    }
    if (this.creep.pos.inRangeTo(flag.pos, this.creep.memory.moveRange)) {
        //console.log("STATE_MOVE_TARGET creep", JSON.stringify(this.creep.pos), "cloes to", JSON.stringify(flag.pos))
        return state.switchTo(this.creep, this.creep.memory.next_state)
    }
    const result = this.creep.moveTo(flag, {reusePath: 5});
    //console.log("STATE_MOVE_TARGET move result", result)
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
            return gf.fatalError("ERR_NOT_OWNER");
        case  ERR_NO_PATH:
            return ERR_NO_PATH; //gf.fatalError("ERR_NO_PATH");
        case ERR_BUSY:                  // The creep is still being spawned.
            //spawning")
            return ERR_BUSY;
        case ERR_NOT_FOUND:     // The specified path doesn't match the creep's location.
            return ERR_NOT_ENOUGH_ENERGY;
        case ERR_INVALID_TARGET:
            return gf.fatalError("ERR_INVALID_TARGET");
        case ERR_TIRED:        // The fatigue indicator of the creep is non-zero.
            return ERR_TIRED;
        case ERR_NO_BODYPART:        // There are no MOVE body parts in this creep’s body.
            return ERR_NO_BODYPART;
        default:
            return gf.fatalError("STATE_MOVE_TARGET unrecognised return", result);
    }
}

module.exports = State;
