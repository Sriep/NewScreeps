/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_MOVE_POS;
    this.creep = creep
}

State.prototype.enact = function () {
    if (this.creep.pos.inRangeTo(this.creep.memory.targetPos, this.creep.memory.moveRange)) {
        return state.switchTo(this.creep, this.creep.memory.next_state)
    }
    const result = this.creep.moveTo(gf.roomPosFromPos(this.creep.memory.targetPos), {reusePath: 5})
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_BUSY:                  // The creep is still being spawned.
            console.log("moveTo returns strange ERR_BUSY error")
            return ERR_BUSY;
        case ERR_NOT_FOUND:     // The specified path doesn't match the creep's location.
            return ERR_NOT_ENOUGH_ENERGY
        case ERR_INVALID_ARGS:          // path is not a valid path array.
            return gf.fatalError("ERR_INVALID_ARGS");
        case ERR_TIRED:        // The fatigue indicator of the creep is non-zero.
            return ERR_TIRED;
        case ERR_NO_BODYPART:        // There are no MOVE body parts in this creep’s body.
            return ERR_RCL_NOT_ENOUGH;
        default:
            console.log("target", JSON.stringify(this.creep.memory.targetPos))
            return gf.fatalError("moveByPath unrecognised return|", result,"|");
    }
}

module.exports = State;