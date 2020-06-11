/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
class CreepMemory {
    constructor(creep) {
        this.creep = creep;
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
        return this.creep.memory.targetPos;
    }
    set targetPos(v) {
        this.creep.memory.targetPos = v;
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
        return this.creep.memory.next_state;
    }
    set nextState(v) {
        this.creep.memory.next_state = v;
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
        return this.creep.memory.pathTargetPos;
    }
    set pathTargetPos(v) {
        this.creep.memory.pathTargetPos = v;
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
        return this.creep.memory.previousPos
    }
    set previousPos(v) {
        this.creep.memory.previousPos = v
    }

    get direction() {
        return this.memory.direction
    }
    set direction(v) {
        this.memory.direction = v
    }

    get nextRoom() {
        return this.memory.nextRoom
    }
    set nextRoom(v) {
        this.memory.nextRoom = v
    }

}

module.exports = CreepMemory;