/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");

function State (creep) {
    //console.log("in state_move_path constructor", creep.name)
    if (!creep)
        console.log("Creat creep state with no creep object")
    if (creep.memory.state !== gc.STATE_EMPTY_IDLE)
        console.log("In empty idele state with creep wrong state: " + JSON.stringify(creep))
    this.type = gc.STATE_MOVE_PATH;
    this.creep = creep
}

State.prototype.enact = function () {
    //console.log("state move enact");
    const targetPos = Game.getObjectById(this.creep.memory.targetId).pos
    if (this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange)) {
        this.creep.memory.state = this.creep.memory.next_state;
        this.creep.memory.next_state = undefined;
        this.creep.say("arrived");
        delete this.creep.memory.moveRange;
        return state.enact(this.creep);
    }
    if (this.creep.pos.x === this.creep.memory.lastx && this.creep.pos.y === this.creep.memory.lasty) {
        this.stuck();
    }
    this.creep.memory.lastx = this.creep.pos.x;
    this.creep.memory.lasty = this.creep.pos.y;

    //path = creep.room.deserializePath(this.creep.memory.path)
    //console.log("creep move path",JSON.stringify(path))
    //const result = this.creep.moveByPath(this.creep.memory.path);

    const result = this.creep.moveTo(targetPos, {reusePath: 5})
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_BUSY:                  // The creep is still being spawned.
            return gf.fatalError("moveTo returns strange ERR_BUSY error");
            //return gf.fatalError("ERR_BUSY");
        case ERR_NOT_FOUND:     // The specified path doesn't match the creep's location.
            return ERR_NOT_ENOUGH_ENERGY
        case ERR_INVALID_ARGS:          // path is not a valid path array.
            return gf.fatalError("ERR_INVALID_ARGS");
        case ERR_TIRED:        // The fatigue indicator of the creep is non-zero.
            return ERR_TIRED;
        case ERR_NO_BODYPART:        // There are no MOVE body parts in this creep’s body.
            return ERR_RCL_NOT_ENOUGH;
        default:
            return gf.fatalError("moveByPath unrecognised return value");
    }
}

State.prototype.stuck = function () {
    this.creep.say("stuck");
}

module.exports = State;