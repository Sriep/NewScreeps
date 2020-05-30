/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const economy = require("economy");
const race = require("race");
const flag = require("flag");
const FlagRoom = require("flag_room");

const state = {

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
        const requireString = "state_" + memory.state;
        const stateConstructor = require(requireString);
        const objState = new stateConstructor(obj);
        objState.enact()
    },

    //--------------------- state switches -------------------------------------

    switchMoveToRoom(creep, roomName, nextState) {
        state.switchToMoveFlag( creep, Game.flags[roomName],24, nextState,);
    },

    switchToMoveFlag(creep, flag, range, nextState) {
        console.log(creep.name,"switchToMoveFlag flag",flag.name,"range", range,"nextstate", nextState);
        creep.memory.state = gc.STATE_MOVE_TARGET;
        creep.memory.targetName = flag.name;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        return state.enact(creep, creep.memory);
    },

    switchToMovePos(creep, targetPos, range, nextState) {
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
        return state.enact(creep, creep.memory);
    },

    switchTo: function (obj, memory, newState, targetId) {
        //console.log("Switch state|", creep.name," |from| ",creep.memory.state, " |to| ", newState)
        if (!obj) {
            gf.fatalError(" no creep given when changing state to", newState, "targetId", targetId);
        }
        if (!newState || newState === "undefined_idle") {
            gf.fatalError(" no state to change to, targetId ", targetId, "memory", JSON.stringify(memory));
        }
        if (targetId) {
            memory.targetId = targetId;
        }
        memory.state = newState;
        //creep.say(this.creepSay[newState]);
        return state.enact(obj, memory);
    },

    //--------------------- state switches end----------------------------------

    countHarvesterPosts: function(room) {
        const fRoom = new FlagRoom(room.name);
        let posts = 0;
        for (let sourceId in fRoom.getSources()) {
            if (fRoom.getSourcePosts(sourceId)) {
                posts += fRoom.getSourcePosts(sourceId).length;
            }
        }
        return posts;
    },

    isHarvestingHarvester: function(creep) {
        return  race.getRace(creep) === gc.RACE_HARVESTER
            && (creep.memory.state === gc.STATE_HARVESTER_BUILD
                || creep.memory.state === gc.STATE_HARVESTER_REPAIR
                || creep.memory.state === gc.STATE_HARVESTER_TRANSFER
                || creep.memory.state === gc.STATE_HARVESTER_HARVEST
                || ( creep.memory.state === gc.STATE_MOVE_POS
                    && creep.memory.next_state === gc.STATE_HARVESTER_HARVEST))
    },

    getCreepAt: function(x,y,roomname) {
        for (let j in Game.creeps) {
            const creep = Game.creeps[j].pos;
            if (creep.pos.x === x && creep.pos.y === y && creep.pos.roomName === roomname) {
                return Game.creeps[j]
            }
        }
        return undefined;
    },

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

    findCollectContainer: function(room) {
        const containerPos = this.getHarvestContainersPos(room);
        let containers = [];
        for (let i in containerPos) {
            const container = this.findContainerAt(gf.roomPosFromPos(containerPos[i]), room.name);
            if (container) {
                containers.push(container);
            }
        }
        if (containers.length === 0) {
            return undefined;
        }
        let maxSoFar = -1;
        let maxIndex = -1;
        for (let i in containers) {
            if (containers[i].store.getUsedCapacity(RESOURCE_ENERGY) > maxSoFar) {
                maxSoFar = containers[i].store.getUsedCapacity(RESOURCE_ENERGY);
                maxIndex = i;
            }
        }
        return containers[maxIndex];
    },

    workerFindTargetSource: function(room, creep) {
        let sources = room.find(FIND_SOURCES);
        if (sources.length === 0)  {
            return undefined;
        }

        if (sources.length === 2 && room.controller.level === 1) {
            const path0 = room.findPath(sources[0].pos, room.controller.pos);
            const path1 = room.findPath(sources[1].pos, room.controller.pos);
            return path0.length > path1.length ? sources[1] : sources[0];
        }

        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        for (let source of sources)  {
            if (!!state.atHarvestingPost(creep.pos)) {
                return source;
            }
            const sourceCreeps = _.filter(Game.creeps, function (c) {
                return c.memory.targetId === source.id;
            });
            if (sourceCreeps.length === 0) {
                return source;
            }
            if (sourceCreeps.length < economy.countAccessPoints(source.pos)) {
                return source;
            }
        }
        return undefined;
    },

    getHarvestContainersPos: function (room) {
        const fRoom = new FlagRoom(room.name);
        const containersPos = [];
        for (let sourceId in fRoom.getSources()) {
            const cPos = fRoom.getSourceContainerPos(sourceId);
            if (cPos) {
                containersPos.push(gf.roomPosFromPos(cPos));
            }
        }
        return containersPos;
    },

    numHarvestersHarvesting: function(policyId) { //done
        return _.filter(Game.creeps, function (creep) {
            return creep.memory.policyId === policyId
                && this.isHarvestingHarvester(creep)
        }).length;
    },

    wsHarvesting: function(policyId) {
        const harvesters = this.getHarvestingHarvesters(policyId);
        let ws = 0;
        for (let i in harvesters) {
            ws += race.workParts(harvesters[i]);
        }
        return ws;
    },

    getHarvestingHarvesters: function(policyId) {
        return _.filter(Game.creeps, function (c) {
            return c.memory.policyId === policyId
                && (c.memory.state === gc.STATE_HARVESTER_BUILD
                    || c.memory.state === gc.STATE_HARVESTER_REPAIR
                    || c.memory.state === gc.STATE_HARVESTER_TRANSFER
                    || c.memory.state === gc.STATE_HARVESTER_HARVEST
                    || c.memory.next_state === gc.STATE_HARVESTER_HARVEST)
        });
    },

    atUpgradingPost: function(pos) {
        const fRoom = new FlagRoom(pos.roomName);
        const posts = fRoom.getControllerPosts();
        for (let i in posts) {
            if (pos.x === posts[i].x && pos.y === posts[i].y){
                return true;
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
        //console.log("findContainerAt", JSON.stringify(pos))
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
/*
    findContainerConstructionNear : function (creep, range) {
        if (!range) {
            range = 0;
        }
        const pos = creep.pos;
        const sites = creep.room.lookForAtArea(
            LOOK_CONSTRUCTION_SITES,
            pos.y-range,
            pos.x-range,
            pos.y+range,
            pos.x+range,
            true,
        );
        for (let i in sites) {
            if (sites[i].constructionSite.structureType === STRUCTURE_CONTAINER) {
                return sites[i].constructionSite
            }
        }
        return undefined;
    },
*/

    //getSourcePosts : function (sourceId) {
    //    if (Game.flags[sourceId]) {
    //        return Game.flags[sourceId].memory.harvesterPosts;
    //    }
    //},
/*
    getSourceLinkPos : function (sourceId) {
        if (Game.flags[sourceId]) {
            const l = gf.roomPosFromPos(Game.flags[sourceId].memory.linkPos);
            if (l) {
                return new RoomPosition(l.x, l.y, l.roomName);
            }
        }
    },

    getSourceContainerPos : function (sourceId) {
        if (Game.flags[sourceId]) {
            return Game.flags[sourceId].memory.containerPos;
        }
    },

    getControllerPosts : function (controllerId) {
        if (Game.flags[controllerId]) {
            return Game.flags[controllerId].memory.upgraderPosts;
        }
    },

    getMineralContainerPos : function(mineralId) {
        if (Game.flags[mineralId]) {
            return Game.flags[mineralId].memory.containerPos;
        }
    },

    getMineralPosts : function(mineralId) {
        if (Game.flags[mineralId]) {
            return Game.flags[mineralId].memory.harvesterPosts;
        }
    },

    getControllerLinkPos : function(controllerId) {
        if (Game.flags[controllerId]) {
            const l = Game.flags[controllerId].memory.linkPos;
            if (l) {
                return new RoomPosition(l.x, l.y, l.roomName);
            }
        }
    },
    */

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
