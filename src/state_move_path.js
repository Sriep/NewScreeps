/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
//const race = require("race");
//const flag = require("flag");
//const FlagRoom = require("flag_room");
const cache = require("cache");
const move = require("state_move");

function StateMovePath (creep) {
    this.type = gc.STATE_MOVE_PATH;
    this.creep = creep;
    this.m = this.creep.memory;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}

StateMovePath.prototype.enact = function () {
    const targetPos = gf.roomPosFromPos(this.m.targetPos);
    console.log(this.creep.name, "STATE_MOVE_PATH pos", JSON.stringify(this.creep.pos), "targetPos",targetPos,
        "path", this.m.path,"dPath", JSON.stringify(cache.deserialisePath(this.m.path)));
    if (this.creep.pos.inRangeTo(targetPos, this.m.moveRange)) {
        //delete this.m.path;
        console.log(this.creep.name, "STATE_MOVE_PATH inRangeTo",targetPos, "range", this.m.moveRange);
        return state.switchTo(this.creep, this.m, this.m.next_state)
    }

    if (this.m.path.length <=1) {
        //delete this.m.path;
        return state.switchToMovePos(
            this.creep, this.m.targetPos, this.m.moveRange, this.m.next_state,
        )
    }
    //const posPath = cache.deserialiseRoPath(this.m.path.substring(0,2) , this.creep.pos.roomName);
    const path0 = cache.deserialisePtAt(this.m.path, 0);
    if (path0.x === this.creep.pos.x && path0.y === this.creep.pos.y) {
        const dPathPos1 = cache.deserialisePosAt(this.m.path,1, this.creep.pos.roomName);
        //console.log(this.creep.name, "path0", JSON.stringify(path0) ,"path1",dPathPos1,"room",this.creep.pos.roomName);
        if (move.pathBlocked(dPathPos1)) {
            this.creep.say("blocked");
            //console.log(this.creep.name,"path blocked at", dPathPos1);
            const path = move.recalculatePath(this.creep);
            if (path) {
                return state.switchToMoveToPath(
                    this.creep,
                    path,
                    this.m.targetPos,
                    this.m.moveRange,
                    this.m.next_state,
                )
            } else {
                return state.switchToMovePos(
                    this.creep, this.m.targetPos, this.m.moveRange, this.m.next_state,
                )
            }
        }
        this.creep.say("rest");
    } else {
        if (this.m.path.length === 2) {
            return state.switchToMoveToPath(
                this.creep, this.m.path, this.m.targetPos, this.m.moveRange, this.m.next_state,
            )
        }
        const path1 = cache.deserialisePtAt(this.m.path, 1);
        //console.log(this.creep.name, "path1",JSON.stringify(path1));
        if (path1.x === this.creep.pos.x && path1.y === this.creep.pos.y) {
            this.creep.say("move path");
            this.m.path = this.m.path.substr(1);
            //path.shift();
        } else {
            if (this.m.path.length === 3) {
                return state.switchToMoveToPath(
                    this.creep, this.m.path, this.m.targetPos, this.m.moveRange, this.m.next_state,
                )
            }
            const path2 = cache.deserialisePtAt(this.m.path,2);
            //console.log(this.creep.name, "path2",JSON.stringify(path2));
            if (path2.x === this.creep.pos.x && path2.y === this.creep.pos.y) {
                this.creep.say("change rooms");
                this.m.path = this.m.path.substr(2);
                //path.shift();
                //path.shift();
            } else {
                this.creep.say("lost");
                return state.switchToMoveToPath(
                    this.creep, this.m.path, this.m.targetPos, this.m.moveRange, this.m.next_state,
                )
            }
        }
    }
    const posPath = cache.deserialiseRoPath(this.m.path.substring(0,2), this.creep.pos.roomName);

    console.log(this.creep.name,"creep pos", this.creep.pos,"moveByPath path", JSON.stringify(posPath), this.creep.pos.roomName, "new path", this.m.path);
    const result = this.creep.moveByPath(posPath);
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
            this.creep.say("tired");
            return ERR_TIRED;
        case ERR_NO_BODYPART:
            return gf.fatalError("ERR_NO_BODYPART");
        default:
            return gf.fatalError("moveByPath unrecognised return|", result,"|");
    }
};


module.exports = StateMovePath;




























