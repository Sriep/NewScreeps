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
const move = require("state_move");

function StateMovePos (creep) {
    this.type = gc.STATE_MOVE_POS;
    this.creep = creep;
    this.m = this.creep.memory;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}

StateMovePos.prototype.enact = function () {
    //console.log(this.creep.name, "in STATE_MOVE_POS");
    const targetPos = gf.roomPosFromPos(this.m.targetPos);

    if (this.creep.pos.inRangeTo(targetPos, this.creep.memory.moveRange)) {
        if (this.m.next_state === gc.STATE_MOVE_PATH) {
            return state.switchToMoveByPath(
                this.creep,
                this.m.path,
                this.m.pathTargetPos,
                this.m.pathRange,
                this.m.pathNextState,
            )
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
    let reuse = 5;
    if (targetPos.roomName === this.creep.pos.roomName) {
        const range = this.creep.pos.getRangeTo(targetPos);
        reuse = range < 5 ? 1 : 5;
    }
    const result = this.creep.moveTo(targetPos, {reusePath: reuse});
    switch (result) {
        case OK:
            break;
        case  ERR_NOT_OWNER:
            return gf.fatalError("ERR_NOT_OWNER");
        case ERR_NO_PATH:
            console.log("STATE_MOVE_POS ERR_NO_PATH", this.creep.pos, "target", targetPos);
            this.pathLost();
            return this.creep.moveTo(targetPos, {reusePath: 0});
        case ERR_BUSY:
            return ERR_BUSY;
        case ERR_NOT_FOUND:
            return gf.fatalError("ERR_NOT_FOUND");
        case ERR_INVALID_ARGS:
            return gf.fatalError("ERR_INVALID_ARGS");
        case ERR_TIRED:
            return ERR_TIRED;
        case ERR_NO_BODYPART:
            return ERR_NO_BODYPART;
        default:
            console.log(this.creep.name, "targetSTATE_MOVE_POS", JSON.stringify(this.creep.memory.targetPos));
            console.log("creep memory", JSON.stringify(this.creep.memory));
            return gf.fatalError("moveByPath unrecognised return|", result,"|");
    }
    this.m.lastpositon = cache.sPoint(this.creep.pos);
};

StateMovePos.prototype.pathLost = function () {
    if (this.m.next_state === gc.STATE_MOVE_PATH) {
        if (this.creep.pos.isNearTo(this.m.targetPos.x, this.m.targetPos.y)) {
            //console.log(this.creep.name, "STATE_MOVE_PATH targetpos", JSON.stringify(this.m.targetPos), "room",
            //    this.creep.pos.roomName,"len", this.m.path.length,"path",this.m.path);
            if (move.pathBlocked(gf.roomPosFromPos(this.m.targetPos))) {
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
                        this.creep, this.m.pathTargetPos, this.m.pathRange, this.m.pathNextState,
                    )
                }
            }
        }
    }

    const creepRace = race.getRace(this.creep);
    //console.log(this.creep.name, "STATE_MOVE_POS creep race", creepRace);
    //console.log(this.creep.name,"STATE_MOVE_POS path lost", JSON.stringify(this.creep.memory.targetPos));
    switch(creepRace) {
        case gc.RACE_HARVESTER:
            const sourceId = state.atHarvestingPost(this.creep.pos);
             if (sourceId) {
                //console.log(this.creep.name,"STATE_MOVE_POS at harvesting pos", sourceId);
                const harvesters = this.getHarvestingHarvesters(this.creep.policyId);
                for (let harvester of harvesters) {
                    if (harvester.memory.targetPos.x === this.creep.x
                        && harvester.memory.targetPos.y === this.creep.y) {
                        delete harvester.memory.targetPos;
                        return state.switchTo(harvester, gc.STATE_HARVESTER_IDLE);
                    }
                }
                this.m.targetId = sourceId;
                this.m.targetPos = this.creep.pos;
                return state.switchTo(this.creep, this.m, gc.STATE_HARVESTER_HARVEST);
            }
            return this.creep.moveTo(gf.roomPosFromPos(this.m.targetPos), {reusePath: 1});

            //return state.switchTo(this.creep, this.creep.memory, creepRace + "_idle");
        //case gc.RACE_WORKER:
            //return;
            //return state.switchTo(this.creep, this.creep.memory, creepRace + "_idle");
        case gc.RACE_PORTER:
            if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return state.switchTo(this.creep, this.m, creepRace + "_idle")
            } else {
                this.creep.moveTo(gf.roomPosFromPos(this.m.targetPos), {reusePath: 1});
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
            this.creep.moveTo(gf.roomPosFromPos(this.m.targetPos), {reusePath: 1});
            return;
            //return gf.fatalError("STATE_MOVE_POS pathLost unrecognised race", creepRace);
    }
};


StateMovePos.prototype.getHarvestingHarvesters = function(policyId) {
    return _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && (c.memory.state === gc.STATE_HARVESTER_BUILD
                || c.memory.state === gc.STATE_HARVESTER_REPAIR
                || c.memory.state === gc.STATE_HARVESTER_TRANSFER
                || c.memory.state === gc.STATE_HARVESTER_HARVEST
                || c.memory.next_state === gc.STATE_HARVESTER_HARVEST)
    });
};



module.exports = StateMovePos;




























