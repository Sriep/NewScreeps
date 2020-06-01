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
function StateMoveTarget (creep) {
    this.type = gc.STATE_MOVE_TARGET;
    this.creep = creep
}

StateMoveTarget.prototype.enact = function () {
    let target;
    //console.log(this.creep.name, "STATE_MOVE_TARGET targetName", this.creep.memory.targetName,
    //    "target id", this.creep.memory.targetId);
    if (this.creep.memory.targetName) {
        target = Game.flags[this.creep.memory.targetName];
        //console.log(this.creep.name, "STATE_MOVE_TARGET inside targetname", target, "target name", this.creep.memory.targetName)
    }
    if (!target) {
        target = Game.getObjectById(this.creep.memory.targetId);
    }
    if (!target) {
        //console.log(this.creep.name, "STATE_MOVE_TARGET no target", target);
        return state.switchTo(this.creep, this.creep.memory, race.getRace(this.creep) + "_idle");
    }
    //console.log(this.creep.name, "STATE_MOVE_TARGET, flag pos", JSON.stringify(target.pos), "flag name", target.name);

    if (this.creep.pos.inRangeTo(target.pos, this.creep.memory.moveRange)) {
        //console.log(this.creep.name,"STATE_MOVE_TARGET creep", JSON.stringify(this.creep.pos), "cloes to", JSON.stringify(target.pos))
        return state.switchTo(this.creep, this.creep.memory, this.creep.memory.next_state)
    }
    const result = this.creep.moveTo(target, {reusePath: 5});
    //console.log(this.creep.name,"STATE_MOVE_TARGET move result", result);
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
            return gf.fatalError("ERR_NOT_OWNER");
        case  ERR_NO_PATH:
            //console.log(this.creep.name,"STATE_MOVE_TARGET creep pos"
            //    , this.creep.pos, "target pos", target.pos);
            //return gf.fatalError("ERR_NO_PATH");
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
};

module.exports = StateMoveTarget;
