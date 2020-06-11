/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
//const cache = require("./cache");

class CreepMemory {
    constructor(creep) {
        this.creep = creep;
    }

    static M(creep) {
        return new CreepMemory(creep)
    }

    get memory() {
        return this.creep.memory
    }
    set memory(v) {
        //delete this.creep.memory; todo is this dangerous?
        this.creep.memory = v;
    }

    get home() {
        return Memory.policies[this.policyId].roomName
    }

    get state() {
        return this.creep.memory.state;
    }
    set state(v) {
        this.creep.memory.state = v;
    }

    get policyId() {
        return this.creep.memory.policyId;
    }
    set policyId(v) {
        this.creep.memory.policyId = v;
    }

    get targetPos() {
        if (this.creep.memory.targetPos) {
            return new RoomPosition(
                this.creep.memory.targetPos.x,
                this.creep.memory.targetPos.y,
                this.creep.memory.targetPos.roomName
            )
        }
        //return this.creep.memory.targetPos;
        //return cache.dPosRn(this.creep.memory.targetPos);
    }
    set targetPos(v) {
        this.creep.memory.targetPos = v;
        //this.creep.memory.targetPos = cache.sPos(v);
    }

    get targetId() {
        return this.creep.memory.targetId;
    }
    set targetId(v) {
        this.creep.memory.targetId = v;
    }

    get targetName() {
        return this.creep.memory.targetName;
    }
    set targetName(v) {
        this.creep.memory.targetName = v;
    }

    get moveRange() {
        return this.creep.memory.moveRange;
    }
    set moveRange(v) {
        this.creep.memory.moveRange = v;
    }

    get nextState() {
        return this.creep.memory.nextState;
    }
    set nextState(v) {
        this.creep.memory.nextState = v;
    }

    get path() {
        return this.creep.memory.path;
    }
    set path(v) {
        this.creep.memory.path = v;
    }

    get pathName() {
        return this.creep.memory.pathName;
    }
    set pathName(v) {
        this.creep.memory.pathName = v;
    }

    get pathTargetPos() {
        if (this.creep.memory.pathTargetPos) {
            return new RoomPosition(
                this.creep.memory.pathTargetPos.x,
                this.creep.memory.pathTargetPos.y,
                this.creep.memory.pathTargetPos.roomName
            )
        }
        //return this.creep.memory.pathTargetPos;
        //return cache.dPosRn(this.creep.memory.pathTargetPos);
    }
    set pathTargetPos(v) {
        this.creep.memory.pathTargetPos = v;
        //this.creep.memory.pathTargetPos = v
        //this.creep.memory.pathTargetPos = cache.sPos(v);
    }

    get pathRange() {
        return this.creep.memory.pathRange;
    }
    set pathRange(v) {
        this.creep.memory.pathRange = v;
    }

    get pathNextState() {
        return this.creep.memory.pathNextState;
    }
    set pathNextState(v) {
        this.creep.memory.pathNextState = v;
    }

    get pathId() {
        return this.creep.memory.pathId
    }
    set pathId(v) {
        this.creep.memory.pathId = v
    }

    get previousState() {
        return this.creep.memory.previousState
    }
    set previousState(v) {
        this.creep.memory.previousState = v
    }

    get previousPos() {
        if (this.creep.memory.previousPos) {
            return new RoomPosition(
                this.creep.memory.previousPos.x,
                this.creep.memory.previousPos.y,
                this.creep.memory.previousPos.roomName
            )
        }
        //return this.creep.memory.previousPos;
        //return cache.dPosRn(this.creep.memory.previousPos);
    }
    set previousPos(v) {
        this.creep.memory.previousPos = v;
        //this.creep.memory.previousPos = cache.sPos(v);
    }

    get direction() {
        return this.creep.memory.direction
    }
    set direction(v) {
        this.creep.memory.direction = v
    }

    get nextRoom() {
        return this.creep.memory.nextRoom
    }
    set nextRoom(v) {
        this.creep.memory.nextRoom = v
    }

    get lastPosition() {
        if (this.creep.memory.lastPosition) {
            return new RoomPosition(
                this.creep.memory.lastPosition.x,
                this.creep.memory.lastPosition.y,
                this.creep.memory.lastPosition.roomName
            )
        }
        //return this.creep.memory.lastPosition
        //return cache.dPosRn(this.creep.memory.lastPosition);
    }
    set lastPosition(v) {
        this.creep.memory.lastPosition = v
        //this.creep.memory.lastPosition = cache.sPos(v);
    }

}

module.exports = CreepMemory


























;