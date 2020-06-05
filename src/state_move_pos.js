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

function StateMovePos (creep) {
    this.type = gc.STATE_MOVE_POS;
    this.creep = creep;
    this.m = this.creep.memory
}

StateMovePos.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_MOVE_POS");
    const targetPos = gf.roomPosFromPos(this.m.targetPos);

    if (this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange)) {
        if (this.m.moveRange === 0) {
            //console.log(this.creep.name, "STATE_MOVE_POS creep at",
            //    JSON.stringify(this.creep.pos), "in range of target",
            //    JSON.stringify(targetPos), "range", this.m.moveRange)
        }
        return state.switchTo(this.creep, this.m, this.m.next_state)
    }
    if (this.m.lastpositon) {
        const lastPos =  cache.dPoint(this.m.lastpositon);
        if (this.creep.pos.x === lastPos.x && this.creep.pos.y === lastPos.y) {
            delete this.m.lastpositon;
            return this.pathLost();
        }
    }

    const result = this.creep.moveTo(targetPos, {reusePath: 5});
    switch (result) {
        case OK:                        // The operation has been scheduled successfully.
            break;
        case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_NO_PATH:
            this.pathLost();
            //console.log(this.creep.name, "move ERR_NO_PATH to", JSON.stringify(this.creep.memory.targetPos))
            return this.creep.moveTo(targetPos, {reusePath: 0});
        case ERR_BUSY:                  // The creep is still being spawned.
            //console.log("moveTo returns  ERR_BUSY error) // thinks means spawning
            return ERR_BUSY;
        case ERR_NOT_FOUND:     // The specified path doesn't match the creep's location.
            return gf.fatalError("ERR_NOT_FOUND");
            //return ERR_NOT_ENOUGH_ENERGY//
        case ERR_INVALID_ARGS:          // path is not a valid path array.
            //return gf.fatalError("ERR_INVALID_ARGS");
        case ERR_TIRED:        // The fatigue indicator of the creep is non-zero.
            return ERR_TIRED;
        case ERR_NO_BODYPART:        // There are no MOVE body parts in this creep’s body.
            return ERR_RCL_NOT_ENOUGH;
        default:
            console.log(this.creep.name, "targetSTATE_MOVE_POS", JSON.stringify(this.creep.memory.targetPos));
            console.log("creep memory", JSON.stringify(this.creep.memory));
            return gf.fatalError("moveByPath unrecognised return|", result,"|");
    }
    this.m.lastpositon = cache.sPoint(this.creep.pos);
    //this.creep.memory.lastroomName = cache.sPoint(this.creep.room.name);

};

StateMovePos.prototype.pathLost = function () {
    const creepRace = race.getRace(this.creep);
    //console.log(this.creep.name, "STATE_MOVE_POS creep race", creepRace);
    //console.log(this.creep.name,"STATE_MOVE_POS path lost", JSON.stringify(this.creep.memory.targetPos));
    switch(creepRace) {
        case gc.RACE_HARVESTER:
            const sourceId = state.atHarvestingPost(this.creep.pos);
            //console.log(this.creep.name, "STATE_MOVE_POS atHarvestingPost", sourceId);
            if (sourceId) {
                console.log(this.creep.name,"STATE_MOVE_POS at harvesting pos", sourceId);
                const harvesters = state.getHarvestingHarvesters(this.creep.policyId);
                for (let harvester of harvesters) {
                    if (harvester.memory.targetPos.x === this.creep.x
                        && harvester.memory.targetPos.y === this.creep.y) {
                        delete harvester.memory.targetPos;
                        state.switchTo(harvester, gc.STATE_HARVESTER_IDLE);
                        break;
                    }
                }
                this.m.targetId = sourceId;
                this.m.targetPos = this.creep.pos;
                return state.switchTo(this.creep, this.m, gc.STATE_HARVESTER_HARVEST);
            }
            return;
            //return state.switchTo(this.creep, this.creep.memory, creepRace + "_idle");
        case gc.RACE_WORKER:
            return;
            //return state.switchTo(this.creep, this.creep.memory, creepRace + "_idle");
        case gc.RACE_PORTER:
            if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return state.switchTo(this.creep, this.m, creepRace + "_idle")
            } else {
                return;
                /*
                // porter hack approaching crowed upgrade container
                if (!Game.flags[this.creep.room.controller.id]) {
                    return;
                }
                const UpgradeContainerPoses = state.getControllerPosts(this.creep.room.controller.id);
                if (!UpgradeContainerPoses || !this.creep.targetPos) {
                    return;
                }
                for (let cPos of UpgradeContainerPoses) {
                    if (this.creep.targetPos.x === cPos.x && this.creep.targetPos.y === cPos.y) {
                        if (this.creep.pos.inRangeTo(targetPos,1)) {
                            const pos = gf.roomPosFromPos(this.creep.targetPos, this.creep.room.name);
                            const path = pos.findPathTo(cPos.x, cPos.y);
                            console.log(this.creep.name,"pos",this.creep.pos,"path",JSON.stringify(path));
                            inTheWay = getCreepAt(path[1].x, path[2].y, this.creep.room.name);
                            console.log(this.creep.name,"swap with", inTheWay.name);
                            state.switchToMovePos(
                                inTheWay,
                                this.creep.pos,
                                0,
                                race.getRace(inTheWay) + "_idle"
                            );
                            if (race.getRace(this.creep) !== gc.RACE_PORTER) {
                                console.log(this.creep.name,"STATE_MOVE_POS pathLost");
                                gf.fatalError("STATE_MOVE_POS In pathLost should be porter");
                            }
                            return state.switchToMovePos(
                                this.creep,
                                inTheWay.pos,
                                0,
                                gc.STATE_PORTER_TRANSFER,
                            );
                        }
                    }
                }
                return state.switchTo(this.creep, this.creep.memory, creepRace + "_full_idle")*/
            }
        case gc.RACE_UPGRADER:
            return state.switchTo(this.creep, this.m, gc.STATE_UPGRADER_IDLE);
        default:
            return;
            //return gf.fatalError("STATE_MOVE_POS pathLost unrecognised race", creepRace);
    }
};





module.exports = StateMovePos;




























