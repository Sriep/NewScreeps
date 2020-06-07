/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
const race = require("race");
const cache = require("cache");

function StateMovePath (creep) {
    this.type = gc.STATE_MOVE_PATH;
    this.creep = creep;
    this.m = this.creep.memory
}

StateMovePath.prototype.enact = function () {
    const targetPos = gf.roomPosFromPos(this.m.targetPos);
    if (this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange)) {
        return state.switchTo(this.creep, this.m, this.m.next_state)
    }

    const path = this.getPath();
    const result = this.creep.moveByPath(path);
    switch (result) {
        case OK:
            break;
        case  ERR_NOT_OWNER:
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_BUSY:
             return ERR_BUSY;
        case ERR_NOT_FOUND:
            return gf.fatalError("ERR_NOT_FOUND");
        case ERR_INVALID_ARGS:
            return gf.fatalError("ERR_INVALID_ARGS");
        case ERR_TIRED:
            return ERR_TIRED;
        case ERR_NO_BODYPART:
            return gf.fatalError("ERR_NO_BODYPART");
        default:
            return gf.fatalError("moveByPath unrecognised return|", result,"|");
    }
};

StateMovePath.prototype.getPath = function () {
    return cache.deserialiseRoPath(this.m.path, this.creep.room.name)
    //return cache.global(StateMovePath.prototype._getPath, this,[],this.creep.name + ".getPath.",);
};

//StateMovePath.prototype._getPath = function() {
    //const path = cache.deserialiseRoPath(this.m.path, this.creep.room.name)
//};




module.exports = StateMovePath;




























