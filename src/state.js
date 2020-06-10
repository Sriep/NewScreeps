/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const gf = require("./gf");
const cache = require("./cache");
const race = require("./race");
const flag = require("./flag");
const FlagRoom = require("./flag_room");

const state = {

    M: {
        State: "state",
        PolicyId: "policyId",
        TargetPos: "targetPos",
        TargetId: "targetId",
        TargetName: "targetName",
        MoveRange: "moveRange",
        NextState: "next_state",
        Path: "path",
        PathName: "pathName",
        PathTargetPos: "pathTargetPos",
        PathRange: "pathRange",
        PathNextState: "pathNextState",
    },

    getM(field) {
        return this.creep.memory[field]
    },

    setM(field, value) {
        this.creep.memory[field] = value;
    },

    stackDepth: 0,

    enactBuilding : function(building) {
        const bFlag = flag.getFlag(building);
        this.stackDepth = 0;
        //console.log(building.structureType,"enactBuilding",JSON.stringify(bFlag.memory));
        this.enact(building, bFlag.memory)
    },

    enactCreep : function(creep) {
        this.stackDepth = 0;
        //console.log(creep.name,"enactCreep",JSON.stringify(creep.memory));
        this.enact(creep, creep.memory)
    },

    enact : function(obj, memory) {
        //console.log("state eneact", obj, "type", obj.structureType, "memory", JSON.stringify(memory));
        if (this.stackDepth > gc.MAX_STATE_STACK) {
            return;
        }
        this.stackDepth++;
        if (!memory.state) {
            console.log("memory", JSON.stringify(memory));
            return gf.fatalError("error! creep" +JSON.stringify(obj) + "with no state " + JSON.stringify(memory));
        }
        let requireString = "state_" + memory.state;
        if (gc.UNIT_TEST) {
            requireString = "./" + requireString;
        }
        const StateConstructor = require(requireString);
        //StateConstructor.prototype = this;
        //StateConstructor.prototype.constructor  = StateConstructor;
        //const objState = Object.create(this);
        //objState.prototype = StateConstructor.prototype;
        const objState = new StateConstructor(obj);
        objState.enact()
    },

    //--------------------- state switches -------------------------------------

    switchMoveToRoom: function(creep, roomName, nextState) {
        this.switchToMoveFlag( creep, Game.flags[roomName],24, nextState,);
    },

    switchToMoveFlag: function(creep, flag, range, nextState) {
        //console.log(creep.name,"switchToMoveFlag flag",flag.name,"range", range,"nextstate", nextState);
        creep.memory.state = gc.STATE_MOVE_TARGET;
        creep.memory.targetName = flag.name;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        return this.enact(creep, creep.memory);
    },

    switchToMoveToPath: function(creep, path, targetPos, range, nextState) {
        //console.log(creep.name,"switchToMoveToPath pos", creep.pos ,"targetPos",JSON.stringify(targetPos),
        //    "range", range,"next state", nextState, "path",path);
        let startIndex = this.findIndexPos(creep.pos, path, 0, false);
        const onPath = !!startIndex;
        if (startIndex === undefined) {
            startIndex = this.indexClosestApproachToPath(creep.pos, path);
        }
        const endIndex = this.findIndexPos(gf.roomPosFromPos(targetPos), path, range, true);
        //console.log("onPath", onPath,"startIndex", startIndex, "endIndex", endIndex,
        //    "path",JSON.stringify(cache.deserialisePath(path)));
        if (startIndex === undefined || endIndex === undefined) {
            console.log("switchToMoveToPath switchToMovePos startIndex", startIndex,"endIndex", endIndex);
            return this.switchToMovePos(creep, targetPos, range, nextState)
        }
        path = path.substr(startIndex, endIndex-startIndex);

        if (onPath) {
        //    console.log("switchToMoveToPath onPath switchToMoveByPath", onPath);
            this.switchToMoveByPath(creep, path, targetPos, range, nextState)
        } else {
            creep.memory.path = path;
            creep.memory.pathTargetPos = targetPos;
            creep.memory.pathRange = range;
            creep.memory.pathNextState = nextState;
            //console.log(creep.name,"switchToMoveToPath move to",JSON.stringify(cache.dPos(path.charAt(0), creep.pos.roomName)) ,"switchToMovePos", JSON.stringify(creep.memory));
            this.switchToMovePos(
                creep,
                cache.dPos(path.charAt(0), creep.pos.roomName),
                0,
                gc.STATE_MOVE_PATH
            )
        }
    },

    switchToMoveByPath: function(creep, path, targetPos, range, nextState) {
        //console.log("switchToMoveByPath", creep.name ,"targetPos",JSON.stringify(targetPos),
        //    "range", range,"next state", nextState, "path",path);
        creep.memory.path = path;
        creep.memory.targetPos = targetPos;
        creep.memory.state = gc.STATE_MOVE_PATH;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        return this.enact(creep, creep.memory);
    },

    switchToMovePos: function(creep, targetPos, range, nextState) {
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
        creep.memory.targetPos = targetPos;
        creep.memory.state = gc.STATE_MOVE_POS;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        //creep.say("go " + nextState)
        //console.log(creep.name,"switchToMovePos memory",JSON.stringify(creep.memory));
        return this.enact(creep, creep.memory);
    },

    switchTo: function (obj, m, newState, targetId) {
        //console.log("Switch state|", creep.name," |from| ",creep.memory.state, " |to| ", newState)
        if (!obj) {
            gf.fatalError(" no creep given when changing state to", newState, "targetId", targetId);
        }
        if (!newState || newState === "undefined_idle") {
            gf.fatalError(" no state to change to, targetId ", targetId, "memory", JSON.stringify(m));
        }
        if (targetId) {
            m.targetId = targetId;
        }
        m.state = newState;
        //creep.say(this.creepSay[newState]);
        return this.enact(obj, m);
    },

    switchBack: function (creep, m) {
        if (creep.pos.isEqualTo(m.previous_pos.x, m.previous_pos.y)
            || m.previous_state.startsWith("move_") ) {
            this.switchTo(creep, m, m.previous_state)
        }
        if (m.targetPos && m.moveRange && m.next_state) {
            gf.assert(m.targetPos.x === m.previous_pos.x && m.targetPos.y === m.previous_pos.y);
            gf.assert(m.next_state === m.previous_state);
            this.switchToMovePos(creep, m.targetPos, m.moveRange, m.next_state)
        }
        this.switchTo(creep, m, race.getRace(this.creep) + "_idle", m.targetId)
    },

    //--------------------- state switches end----------------------------------

    indexClosestApproachToPath: function(pos, path) {
        let lastX, lastY;
        const ranges = [];
        for ( let i = 0 ; i < path.length ; i++ ) {
            const pt = cache.dPoint(path.charAt(i));
            if (Math.abs(lastX-pt.x) > 2 || Math.abs(lastY-pt.y) > 2) {
                break;
            }
            const range = pos.getRangeTo(pt.x, pt.y);
            lastX = pt.x;
            lastY = pt.y;
            ranges.push({range: range, index: i})
        }
        ranges.sort( (r1, r2) => { return r1.range-r2.range });
        return ranges[0].index;
    },

    findIndexPos: function(pos, path, range, reverse) {
        if (reverse) {
            const endPt  = cache.dPoint(path.charAt(path.length-1));
            if (pos.inRangeTo(endPt.x, endPt.y, 4)) {
                return path.length;
            }
        }

        const start = reverse ? path.length-1 : 0;
        const end = reverse ? 0 : path.length;
        const delta = reverse ? -1 : 1;
        let lastX, lastY;
        for ( let i = start ; i*delta < end*delta ; i+=delta ) {
            const pt  = cache.dPoint(path.charAt(i));
            if (Math.abs(lastX-pt.x) > 2 || Math.abs(lastY-pt.y) > 2) {
                break;
            }
            if (pos.getRangeTo(pt.x, pt.y) === range) {
                return i;
            }
            lastX = pt.x;
            lastY = pt.y;
        }
    },

    // ------------------------------------- assorted functions --------------

    atHarvestingPost: function(pos) {
        const fRoom = new FlagRoom(pos.roomName);
        for (let sourceId in fRoom.getSources()) {
            const posts = fRoom.getSourcePosts(sourceId);
            for (let post of posts) {
                if (pos.x === post.x && pos.y ===post.y) {
                    return sourceId
                }
            }
        }
        return false;
    },

    spaceForHarvest: function (creep) {
        const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
        if (freeCapacity === 0) {
            return false;
        }
        return creep.store.getFreeCapacity(RESOURCE_ENERGY)
            > race.workParts(creep)*HARVEST_POWER;
    },

    findContainerAt : function (pos) {
        if (!pos) {
            return undefined;
        }
        const StructAt = pos.lookFor(LOOK_STRUCTURES);
        if (StructAt.length > 0 && StructAt[0].structureType === STRUCTURE_CONTAINER) {
            return StructAt[0];
        }
        return undefined;
    },

    findContainerConstructionAt : function (pos) {
        const StructAt = pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (StructAt.length > 0 && (StructAt[0].structureType === STRUCTURE_CONTAINER
            || StructAt[0].structureType === STRUCTURE_ROAD)) {
            return StructAt[0];
        }
        return undefined;
    },

    findContainerOrConstructionAt : function (pos) {
        const container = this.findContainerAt(pos);
        if (container)
        {
            return container;
        }
        return this.findContainerConstructionAt(pos)
    },

    getObjAtPos(pos, type) {
        if (pos) {
            for (let struc of pos.lookFor(LOOK_STRUCTURES)) {
                if (struc.structureType === type) {
                    return struc;
                }
            }
        }
    }

};

    module.exports = state;
