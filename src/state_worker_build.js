/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");

function StateWorkerBuild (creep) {
    this.type = gc.STATE_WORKER_BUILD;
    this.creep = creep
}

StateWorkerBuild.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_WORKER_BUILD");
    if (this.creep.store.getUsedCapacity() === 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_WORKER_IDLE);
    }
    const target = Game.getObjectById(this.creep.memory.targetId);
    //console.log("STATE_WORKER_BUILD target",target,"target",JSON.stringify(target));
    if (!target) {
        //console.log("STATE_WORKER_BUILD no target id", this.creep.memory.targetId);
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_WORKER_FULL_IDLE);
    }
    const result = this.creep.build(target);
    //console.log("STATE_WORKER_BUILD result", result);
    switch (result) {
        case OK:
            break;
        case  ERR_NOT_OWNER:
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_BUSY:
            return gf.fatalError("ERR_BUSY");
        case ERR_NOT_ENOUGH_RESOURCES:
            return gf.fatalError("ERR_NOT_ENOUGH_RESOURCES");
        case ERR_INVALID_TARGET:
            // no longer valid build, maybe the room's rcl dropped.
            //console.log(this.creep.name,"STATE_WORKER_BUILD ERR_INVALID_TARGET")
            target.remove();
            delete this.creep.memory.targetId;
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_WORKER_FULL_IDLE);
        case ERR_NOT_IN_RANGE:
            return state.switchTo(this.creep, this.creep.memory, gc.STATE_WORKER_FULL_IDLE);
        case ERR_NO_BODYPART:
            return gf.fatalError("ERR_NO_BODYPART");
        default:
            return gf.fatalError("no valid result");
    }
    //console.log("STATE_WORKER_BUILD dropped though")
};

module.exports = StateWorkerBuild;