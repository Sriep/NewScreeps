/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gf = require("./gf");
const gc = require("./gc");
const state = require("./state");
const race = require("./race");
const StateCreep = require("./state_creep");
const CreepMemory = require("./creep_memory");
//const _ = require("lodash");

class StateMovePos extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        if (this.creep.pos.inRangeTo(this.targetPos, this.moveRange)) {
            if (this.nextState === gc.STATE_MOVE_PATH) {
                return this.switchToMoveByPath(
                    this.path,
                    this.pathTargetPos,
                    this.pathRange,
                    this.pathNextState,
                )
            }
            return this.switchTo(this.nextState)
        }
        if (this.lastPosition) {
            //console.log("StateMovePos lastPosition", JSON.stringify(this.lastPosition));
            const lastPos =  this.lastPosition;
            if (this.creep.pos.x === lastPos.x && this.creep.pos.y === lastPos.y) {
                this.lastPosition = undefined;
                return this.pathLost();
            }
        }
        let reuse = 5;
        if (this.targetPos.roomName === this.creep.pos.roomName) {
            const range = this.creep.pos.getRangeTo(this.targetPos);
            reuse = range < 5 ? 1 : 5;
        }
        const result = this.creep.moveTo(this.targetPos, {reusePath: reuse});
        switch (result) {
            case OK:
                break;
            case  ERR_NOT_OWNER:
                return gf.fatalError("ERR_NOT_OWNER");
            case ERR_NO_PATH:
                console.log("STATE_MOVE_POS ERR_NO_PATH", this.creep.pos, "target", this.targetPos);
                this.pathLost();
                return this.creep.moveTo(this.targetPos, {reusePath: 0});
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
                return gf.fatalError("moveByPath unrecognised return|", result,"|");
        }
        this.lastPosition = this.creep.pos;
    };

    pathLost() {
        if (this.nextState === gc.STATE_MOVE_PATH) {
            if (this.creep.pos.isNearTo(this.targetPos.x, this.targetPos.y)) {
                //console.log(this.creep.name, "STATE_MOVE_PATH targetpos", JSON.stringify(this.targetPos), "room",
                //    this.creep.pos.home,"len", this.path.length,"path",this.path);
                if (this.pathBlocked(gf.roomPosFromPos(this.targetPos))) {
                    this.recalculatePath();
                    return this.switchToMovePos(
                        this.pathTargetPos, this.pathRange, this.pathNextState,
                    )
                }
            }
        }

        const creepRace = race.getRace(this.creep);
        //console.log(this.creep.name, "STATE_MOVE_POS creep race", creepRace);
        switch(creepRace) {
            case gc.RACE_HARVESTER:
                const sourceId = state.atHarvestingPost(this.creep.pos);
                if (sourceId) {
                    //console.log(this.creep.name,"STATE_MOVE_POS at harvesting pos", sourceId);
                    const harvesters = this.getHarvestingHarvesters(this.creep.policyId);
                    for (let harvester of harvesters) {
                        const m = CreepMemory.M(harvester);
                        if (m.targetPos.x === this.creep.x && m.targetPos.y === this.creep.y) {
                            m.targetPos = undefined;
                            m.state = gc.STATE_HARVESTER_IDLE;
                        }
                    }
                    this.targetId = sourceId;
                    this.targetPos = this.creep.pos;
                    return this.switchTo( gc.STATE_HARVESTER_HARVEST);
                }
                return this.creep.moveTo(gf.roomPosFromPos(this.targetPos), {reusePath: 1});
            case gc.RACE_PORTER:
                if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    return this.switchTo( creepRace + "_idle")
                } else {
                    return this.creep.moveTo(gf.roomPosFromPos(this.targetPos), {reusePath: 1});
                }
            case gc.RACE_UPGRADER:
                return this.switchTo( gc.STATE_UPGRADER_IDLE);
            default:
                this.creep.moveTo(gf.roomPosFromPos(this.targetPos), {reusePath: 1});
                return;
        }
    };

    getHarvestingHarvesters(policyId) {
        return _.filter(Game.creeps, function (c) {
            const m = CreepMemory.M(c);
            return m.policyId === policyId
                && (m.state === gc.STATE_HARVESTER_BUILD
                    || m.state === gc.STATE_HARVESTER_REPAIR
                    || m.state === gc.STATE_HARVESTER_TRANSFER
                    || m.state === gc.STATE_HARVESTER_HARVEST
                    || m.nextState === gc.STATE_HARVESTER_HARVEST)
        });
    };

}

module.exports = StateMovePos;




























