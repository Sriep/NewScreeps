/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const CreepMemory = require("./creep_memory");
const state = require("./state");

class StateCreep extends CreepMemory {
    constructor(creep) {
        super(creep);
    }

    enactState() {
        if (this.stackDepth && this.stackDepth >= gc.MAX_STATE_STACK) {
            return;
        }
        if (!this.state) {
            return gf.fatalError("error! creep",JSON.stringify(this.creep), "with no state ", JSON.stringify(this.memory));
        }
        const requireString = "./state_" + this.state;
        const StateConstructor = require(requireString);
        const creepState = new StateConstructor(this.creep);
        creepState.stackDepth = this.stackDepth ? this.stackDepth+1 : 1;
        creepState.enact();
    }

    switchMoveToRoom(roomName, nextState) {
        this.switchToMoveFlag(Game.flags[roomName],24, nextState,);
    }

    switchToMoveFlag(flag, range, nextState) {
        //console.log(this.this.this.this.this.this.this.this.this.this.this.this.this.creep.name,"switchToMoveFlag flag",flag.name,"range", range,"nextstate", nextState);
        this.state = gc.STATE_MOVE_TARGET;
        this.targetName = flag.name;
        this.moveRange = range;
        this.nextState = nextState;
        return this.enactState();
    }

    switchToMoveToPath(path, targetPos, range, nextState) {
        //console.log(creep.name,"switchToMoveToPath pos", creep.pos ,"targetPos",JSON.stringify(targetPos),
        //    "range", range,"next state", nextState, "path",path);
        let startIndex = state.findIndexPos(this.creep.pos, path, 0, false);
        const onPath = !!startIndex;
        if (startIndex === undefined) {
            startIndex = state.indexClosestApproachToPath(this.creep.pos, path);
        }
        const endIndex = state.findIndexPos(gf.roomPosFromPos(targetPos), path, this.range, true);
        //console.log("onPath", onPath,"startIndex", startIndex, "endIndex", endIndex,
        //    "path",JSON.stringify(cache.deserialisePath(path)));
        if (startIndex === undefined || endIndex === undefined) {
            console.log("switchToMoveToPath switchToMovePos startIndex", startIndex,"endIndex", endIndex);
            return this.switchToMovePos(targetPos, range, nextState)
        }
        path = path.substr(startIndex, endIndex-startIndex);

        if (onPath) {
            //    console.log("switchToMoveToPath onPath switchToMoveByPath", onPath);
            this.switchToMoveByPath(path, targetPos, range, nextState)
        } else {
            this.path = path;
            this.pathTargetPos = targetPos;
            this.pathRange = range;
            this.pathNextState = nextState;
            //console.log(creep.name,"switchToMoveToPath move to",JSON.stringify(cache.dPos(path.charAt(0), creep.pos.home)) ,"switchToMovePos", JSON.stringify(this.memory));
            this.switchToMovePos(
                cache.dPos(path.charAt(0), this.creep.pos.roomName),
                0,
                gc.STATE_MOVE_PATH
            )
        }
    }

    switchToMoveByPath(path, targetPos, range, nextState) {
        this.path = path;
        this.targetPos = targetPos;//this.pathTargetPos;
        this.moveRange = range;//this.pathRange;
        this.nextState = nextState;//this.pathNextState;
        this.state = gc.STATE_MOVE_PATH;
        return this.enactState();
    }

    switchToMovePos(targetPos, range, nextState) {
        if (range !== 0 && !range) {
            console.log("switchToMovePos", creep.name,"pos",targetPos,"range", range,"next",nextState);
            gf.fatalError(creep.name + " move to position with no range selected."
                + " target pos" + JSON.stringify(targetPos) + " next state " + nextState);
        }
        if (!targetPos) {
            console.log("switchToMovePos", creep.name,"pos",targetPos,"range", range,"next",nextState);
            gf.fatalError(creep.name + " move to position but no position given"
                + " range " + range.toString() + " next state " + nextState);
        }
        if (!nextState) {
            gf.fatalError(creep.name + " move to position with no next sate provided."
                + " target pos " + JSON.stringify(targetPos) + " range " + range.toString());
        }
        this.targetPos = targetPos;
        this.state = gc.STATE_MOVE_POS;
        this.moveRange = range;
        this.nextState = nextState;
        return this.enactState();
    }

    switchTo(newState, targetId) {
        if (!newState || newState === "undefined_idle") {
            gf.fatalError(" no state to change to, targetId ", targetId, "memory", JSON.stringify(m));
        }
        if (targetId) {
            this.targetId = targetId;
        }
        this.state = newState;
        return this.enactState();
    }

    switchBack() {
        if (this.creep.pos.isEqualTo(this.previousPos.x, this.previousPos.y)
            || this.previousState.startsWith("move_") ) {
            this.switchTo(this.previousState)
        }
        if (this.targetPos && this.moveRange && this.nextState) {
            gf.assert(this.targetPos.x === this.previousPos.x && this.targetPos.y === this.previousPos.y);
            gf.assert(this.nextState === this.previousState);
            this.switchToMovePos(this.targetPos, this.moveRange, this.nextState)
        }
        this.switchTo( race.getRace(creep) + "_idle", this.targetId)
    }

    // utility functions that use the memory object

    recalculatePath() {
        if (!Game.rooms[this.targetPos.roomName]) {
            return;
        }
        const home = policy.getPolicy(this.policyId).roomName;
        console.log("recalculatePath homeid", home);
        const fRoom = flag.getRoom(this.targetPos.roomName);
        if (fRoom.resetPaths(home)) {
            switch (race.getRace(this.creep)) {
                case gc.RACE_HARVESTER:
                    return fRoom.getSPath(home, this.targetId, fRoom.PathTo.Spawn, true);
                case gc.RACE_PORTER:
                    //const obj = Game.getObjectById(this.targetId);
                    return fRoom.getSPath(
                        home,
                        this.targetId,
                        fRoom.PathTo.Controller,
                        this.targetPos.roomName !== home
                    );
                case gc.RACE_RESERVER:
                    return fRoom.getSPath(home, this.targetId, fRoom.PathTo.Spawn, true);
                default:
            }
        }
    }


}

module.exports = StateCreep;