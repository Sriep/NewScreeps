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

function State (creep) {
    this.type = gc.STATE_MOVE_POS;
    this.creep = creep
}

State.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_MOVE_POS");
    const targetPos = gf.roomPosFromPos(this.creep.memory.targetPos);
    //console.log(this.creep, "move towardsSTATE_MOVE_POS", JSON.stringify(targetPos), "range", this.creep.memory.moveRange);
    //console.log("check creep pos", JSON.stringify(this.creep.pos),
    //    "is in rage",  this.creep.memory.moveRange, "of target", JSON.stringify(targetPos))
    //console.log("result of this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange)", this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange))

    if (this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange)) {
        if (this.creep.memory.moveRange === 0) {
            console.log("STATE_MOVE_POS creep at", JSON.stringify(this.creep.pos), "in range of target",
                JSON.stringify(targetPos), "range", this.creep.memory.moveRange)
        }
        return state.switchTo(this.creep, this.creep.memory.next_state)
    }
    if (this.creep.memory.lastpositon) {
        const lastPos =  cache.dPoint(this.creep.memory.lastpositon);
       // console.log(this.creep.name,"pos", JSON.stringify(lastPos), "cached",this.creep.memory.lastpositon)
        if (this.creep.pos.x === lastPos.x && this.creep.pos.y === lastPos.y) {
            delete this.creep.memory.lastpositon;
            //console.log("STATE_MOVE_POS stuck");
            return this.pathLost();
        }
    }

    //console.log(this.creep.name, "about to call moveTo", JSON.stringify(targetPos), "{reusePath: 5} ");
    const result = this.creep.moveTo(targetPos, {reusePath: 5});
    if (result === OK) {
        //const mInfo = this.creep.memory._move;
        //console.log(this.creep.name, "STATE_MOVE_POS current posiotion", JSON.stringify(this.creep.pos));
        //console.log(this.creep.name, "STATE_MOVE_POS move info after move", JSON.stringify(mInfo));
        //console.log(this.creep.name, "STATE_MOVE_POS path after move", JSON.stringify(Room.deserializePath(mInfo.path)));
        //console.log("STATE_MOVE_POS result of move by",this.creep.name , "is", result);
    }
    //console.log("result of move bySTATE_MOVE_POS",this.creep.name , "is", result);
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
    this.creep.memory.lastpositon = cache.sPoint(this.creep.pos);
    //this.creep.memory.lastroomName = cache.sPoint(this.creep.room.name);

};

State.prototype.pathLost = function () {
    const creepRace = race.getRace(this.creep);
    //console.log(this.creep.name, "STATE_MOVE_POS creep race", creepRace);
    //console.log(this.creep.name,"STATE_MOVE_POS path lost", JSON.stringify(this.creep.memory.targetPos))
    switch(creepRace) {
        case gc.RACE_HARVESTER:
            const sourceId = state.atHarvestingPost(this.creep.pos);
            //console.log(this.creep.name, "atHarvestingPost", sourceId);
            if (sourceId) {
                console.log(this.creep.name,"STATE_HARVESTER_IDLE at harvesting pos", sourceId);
                harvesters = state.getHarvestingHarvesters(this.creep.policyId);
                for (let i in harvesters) {
                    if (harvester.memory.targetPos.x === this.creep.x
                        && harvester.memory.targetPos.y === this.creep.y) {
                        delete harvester.memory.targetPos;
                        state.switchTo(harvester, gc.STATE_HARVESTER_IDLE);
                        break;
                    }
                }
                this.creep.memory.targetId = sourceId;
                this.creep.memory.targetPos = this.creep.pos;
                return state.switchTo(this.creep, gc.STATE_HARVESTER_HARVEST);
            }
            return;
            //return state.switchTo(this.creep, creepRace + "_idle");
        case gc.RACE_WORKER:
            return;
            //return state.switchTo(this.creep, creepRace + "_idle");
        case gc.RACE_PORTER:
            if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return state.switchTo(this.creep, creepRace + "_idle")
            } else {
                // porter hack approaching crowed upgrade container
                if (!Game.flags[this.creep.room.controller.id]) {
                    return;
                }
                const UpgradeContainerPos = Game.flags[this.creep.room.controller.id].memory.containerPos;
                if (this.creep.targetPos && race.getRace(this.creep) === gc.RACE_PORTER
                    && (this.creep.targetPos.x === UpgradeContainerPos.x
                        && this.creep.targetPos.y === UpgradeContainerPos.y)) {
                    if (this.creep.pos.inRangeTo(targetPos,1)) {
                        const pos = gf.roomPosFromPos(this.creep.targetPos, this.creep.room.name);
                        const path = pos.findPathTo(UpgradeContainerPos.x, UpgradeContainerPos.y);
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

                return state.switchTo(this.creep, creepRace + "_full_idle")
            }
        case gc.RACE_UPGRADER:
            return state.switchTo(this.creep, gc.STATE_UPGRADER_IDLE);
        default:
            return;
            //return gf.fatalError("STATE_MOVE_POS pathLost unrecognised race", creepRace);
    }
};





module.exports = State;




























