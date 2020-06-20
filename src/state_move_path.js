/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const cache = require("cache");
const StateCreep = require("./state_creep");

class StateMovePath  extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        const targetPos = gf.roomPosFromPos(this.targetPos);
        //console.log(this.creep.name, "STATE_MOVE_PATH pos", JSON.stringify(this.creep.pos), "targetPos",targetPos,
        //    "path", this.path,"dPath", JSON.stringify(cache.deserialisePath(this.path)));
        if (this.creep.pos.inRangeTo(targetPos, this.moveRange)) {
            //delete this.path;
            //console.log(this.creep.name, "STATE_MOVE_PATH inRangeTo",targetPos, "range", this.moveRange);
            return this.switchTo( this.nextState)
        }

        if (this.path.length <=1) {
            //delete this.path;
            return this.switchToMovePos(
                this.targetPos, this.moveRange, this.nextState,
            )
        }
        //const posPath = cache.deserialiseRoPath(this.path.substring(0,2) , this.creep.pos.home);
        const path0 = cache.deserialisePtAt(this.path, 0);
        if (path0.x === this.creep.pos.x && path0.y === this.creep.pos.y) {
            const dPathPos1 = cache.deserialisePosAt(this.path,1, this.creep.pos.roomName);
            //console.log(this.creep.name, "path0", JSON.stringify(path0) ,"path1",dPathPos1,"room",this.creep.pos.home);
            if (this.pathBlocked(dPathPos1)) {
                this.recalculatePath();
                 return this.switchToMovePos(
                    this.creep, this.targetPos, this.moveRange, this.nextState,
                )
            }
            //this.creep.say("rest");
        } else {
            if (this.path.length === 2) {
                return this.switchToMoveToPath(
                    this.path, this.targetPos, this.moveRange, this.nextState,
                )
            }
            const path1 = cache.deserialisePtAt(this.path, 1);
            //console.log(this.creep.name, "path1",JSON.stringify(path1));
            if (path1.x === this.creep.pos.x && path1.y === this.creep.pos.y) {
                //this.creep.say("move path");
                this.path = this.path.substr(1);
                //path.shift();
            } else {
                if (this.path.length === 3) {
                    return this.switchToMoveToPath(
                        this.path, this.targetPos, this.moveRange, this.nextState,
                    )
                }
                const path2 = cache.deserialisePtAt(this.path,2);
                //console.log(this.creep.name, "path2",JSON.stringify(path2));
                if (path2.x === this.creep.pos.x && path2.y === this.creep.pos.y) {
                    //this.creep.say("change rooms");
                    this.path = this.path.substr(2);
                } else {
                    return this.switchToMoveToPath(
                        this.path, this.targetPos, this.moveRange, this.nextState,
                    )
                }
            }
        }
        const posPath = cache.deserialiseRoPath(this.path.substring(0,2), this.creep.pos.roomName);

        //console.log(this.creep.name,"creep pos", this.creep.pos,"moveByPath path", JSON.stringify(posPath), this.creep.pos.home, "new path", this.m.path);
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
                //this.creep.say("tired");
                return ERR_TIRED;
            case ERR_NO_BODYPART:
                return gf.fatalError("ERR_NO_BODYPART");
            default:
                return gf.fatalError("moveByPath unrecognised return|", result,"|");
        }
    };
}




module.exports = StateMovePath;




























