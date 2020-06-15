/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const cache = require("./cache");
const race = require("./race");
const flag = require("./flag");
const FlagRoom = require("./flag_room");
const CreepMemory = require("./creep_memory");

const state = {

    stackDepth: 0,

    enactBuilding : function(building) {
        let requireString = "state_" + flag.getFlag(building).memory.state;
        requireString = "./" + requireString;
        const StateConstructor = require(requireString);
        const creepState = new StateConstructor(building);
        creepState.enact();
    },

    enactCreep : function(creep) {
        let requireString = "state_" + CreepMemory.M(creep).state;
        requireString = "./" + requireString;
        const StateConstructor = require(requireString);
        const creepState = new StateConstructor(creep);
        creepState.enact();
    },
/*
    enactObj : function(obj, memory) {
        if (this.stackDepth > gc.MAX_STATE_STACK) {
            return;
        }
        this.stackDepth++;
        if (!memory.state) {
            console.log("memory", JSON.stringify(memory));
            return gf.fatalError("error! creep" +JSON.stringify(obj) + "with no state " + JSON.stringify(memory));
        }

        let requireString = "state_" + memory.state;
        requireString = "./" + requireString;
        const StateConstructor = require(requireString);
        const objState = new StateConstructor(obj);
        objState.enact();
    },
*/
    indexClosestApproachToPath: function(pos, path) {
        let lastX, lastY;
        const ranges = [];
        for ( let i = 0 ; i < path.length ; i++ ) {
            const pt = cache.dPoint(path.charAt(i));
            if (lastX !== undefined && lastY !== undefined
                && (Math.abs(lastX-pt.x) > 2 || Math.abs(lastY-pt.y) > 2)) {
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
            if  (lastX !== undefined && lastY !== undefined
                && (Math.abs(lastX-pt.x) > 2 || Math.abs(lastY-pt.y) > 2)) {
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
        for (let sourceId in fRoom.sources) {
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
        //console.log("findContainerAt pos",pos);
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
        //console.log(JSON.stringify(pos),"getObjAtPos pos",pos,"type", type,"x",pos.x, pos.y, pos.roomName);
        if (pos) {
            //console.log("getObjAtPos lookedfor",JSON.stringify(pos.lookFor(LOOK_STRUCTURES)));
            for (let struct of pos.lookFor(LOOK_STRUCTURES)) {
                if (struct.structureType === type) {
                    return struct;
                }
            }
        }
    }

};
if (gc.USE_PROFILER && !gc.UNIT_TEST) {
    const profiler = require("screeps-profiler");
    profiler.registerObject(state, 'state');
}
module.exports = state;
