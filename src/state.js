/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const economy = require("economy");
const race = require("race");

const state = {
    stackDepth: 0,

    enactCreep : function(creep) {
        this.stackDepth = 0;
        this.enact(creep, true)
    },

    enact : function(creep) {
        //console.log("state stack depth", this.stackDepth)
        if (this.stackDepth > gc.MAX_STATE_STACK) {
            //console.log("state stack too big");
            return;
        }
        this.stackDepth++;
        if (!creep.memory.policyId)
            {
                return gf.fatalError("error! creep" + creep.name + " with no policy " + JSON.stringify(creep.memroy));
            }
        if (!creep.memory.state)
            {
                return gf.fatalError("error! creep" + creep.name + "with no state " + JSON.stringify(creep.memory));
            }
        requireString = "state_" + creep.memory.state;
        const stateConstructor = require(requireString);
        const creepState = new stateConstructor(creep);
        creepState.enact()
    },

    switchToMoveFlag(creep, flag, range, nextState) {
        creep.memory.state = gc.STATE_MOVE_TARGET;
        creep.memory.targetName = flag.name;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        return state.enact(creep);
    },

    switchToMovePos(creep, targetPos, range, nextState) {
        if (range !== 0 && !range) {
            console.log("switchToMovePos", creep.name,targetPos,"range", range,"next",nextState);
            gf.fatalError(creep.name + " move to position with no range selected."
                + " target pos" + JSON.stringify(targetPos) + " next state " + nextState);
        }
        if (!targetPos) {
            console.log("switchToMovePos", creep.name,targetPos,"range", range,"next",nextState);
            gf.fatalError(creep.name + " move to position but no postion given"
                + " range " + range.toString() + " next state " + nextState);
        }
        if (!nextState) {
            gf.fatalError(creep.name + " move to position with no next sate provided."
                + " targetr pos " + JSON.stringify(targetPos) + " range " + range.toString());
        }
        creep.memory.targetPos = targetPos;
        creep.memory.state = gc.STATE_MOVE_POS;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        //creep.say("go " + nextState)
        return state.enact(creep);
    },

    switchTo: function (creep, newState, targetId) {
        //console.log("Switch state|", creep.name," |from| ",creep.memory.state, " |to| ", newState)
        if (!creep) {
            gf.fatalError(" no creep given when changing state to", newState, "targetId", targetId);
        }
        if (!newState || newState === "undefined_idle") {
            gf.fatalError(creep.name + " no state to change to, targetId ", targetId);
        }
        if (targetId) {
            creep.memory.targetId = targetId;
        }
        creep.memory.state = newState;
        //creep.say(this.creepSay[newState]);
        return state.enact(creep);
    },

    countHarvesterPosts: function(room) {
        const sources = room.find(FIND_SOURCES);
        let posts = 0;
        for (let i in sources) {
             if (Game.flags[sources[i].id].memory.harvesterPosts) {
                posts += Game.flags[sources[i].id].memory.harvesterPosts.length;
            }
        }
        return posts;
    },

    countUpgraderPosts: function(room) { //done
        let countPosts = 0;
        for (let cPosts of Game.flags[room.controller.id].memory.upgraderPosts[0].posts) {
            countPosts += cPosts.length
        }
        return countPosts;
    },

    findFreeHarvesterPost: function(room) {
        let sources = room.find(FIND_SOURCES);
        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        for (let s in sources) {
            const flag = Game.flags[sources[s].id];
            const posts = flag.memory.harvesterPosts;
            for (let i in posts) {
                const post = posts[i];
                //console.log("findFreeHarvesterPost check post", JSON.stringify(post));
                //const post = gf.roomPosFromPos(posts[i], room.name);
                if (this.isHarvesterPostFree(post, room.name)) {
                    post.source = sources[s];
                    return post;
                }
            }
        }
        return undefined;
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

    atHarvestingPostWithUndepletedSourceId: function(pos) {
        let sources = Game.rooms[pos.roomName].find(FIND_SOURCES);
        for (let i in sources) {
            const flag = Game.flags[sources[i].id];
            const posts = flag.memory.harvesterPosts;
            for (let j in posts) {
                if (pos.x === posts[j].x && pos.y ===posts[j].y) {
                    if (sources[i].energy > 0) {
                        return sources[i].id
                    } else {
                        return false;
                    }
                }
            }
        }
        return false;
    },

    isHarvesterPostFree: function (pos, roomName) {
        for (let j in Game.creeps) {
            if (this.isHarvestingHarvester(Game.creeps[j])) {
                //console.log("isHarvesterPostFree", pos.x, pos.y, roomName)
                if (Game.creeps[j].memory.targetPos.x === pos.x
                    && Game.creeps[j].memory.targetPos.y === pos.y
                    && Game.creeps[j].room.name === roomName) {
                    return false;
                }
            }
        }
        return true;
    },

    findTargetSource: function(room) {
        let sources = room.find(FIND_SOURCES);
        if (sources.length === 0)
            {
                return undefined;
            }
        // todo also sort by tick to regenerate if both empty.
        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        for (let i = 0; i < sources.length; i++)  {
            const sourceCreeps = _.filter(Game.creeps, function (c) {
                return c.memory.targetId === sources[i].id;
            });
            if (sourceCreeps.length === 0)
                {
                    return sources[i];
                }
            if (sourceCreeps.length < economy.countAccessPoints(sources[i].pos))
                {
                    return sources[i];
                }
        }
        return undefined;
    },

    getHarvestContainersPos: function (room) {
        const sources = room.find(FIND_SOURCES);
        const containersPos = [];
        for (let i in sources) {
            const flag = Game.flags[sources[i].id];
            if (flag.memory.containerPos) {
                containersPos.push(gf.roomPosFromPos(flag.memory.containerPos));
            }
        }
        return containersPos;
    },

    isHarvesterAndUpgradeContainer: function(room) {
        const upos = Game.flags[room.controller.id].memory.containerPos;
        if (!upos || !this.findContainerAt(gf.roomPosFromPos(upos, room.name))) {
            return false;
        }
        const positions =  this.getHarvestContainersPos(room);
        for (let i in positions) {
            if (this.findContainerAt(gf.roomPosFromPos(positions[i], room.name))) {
                return true;
            }
        }
        return false;
    },

    getHarvestingHarvesters: function(policyId) {
        return _.filter(Game.creeps, function (c) {
            return c.memory.policyId === policyId
                && race.getRace(c) === gc.RACE_HARVESTER
                && (c.memory.state === gc.STATE_HARVESTER_BUILD
                    || c.memory.state === gc.STATE_HARVESTER_REPAIR
                    || c.memory.state === gc.STATE_HARVESTER_TRANSFER
                    || c.memory.state === gc.STATE_HARVESTER_HARVEST
                    || c.memory.next_state === gc.STATE_HARVESTER_HARVEST)
        });
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

    isHarvestingHarvester: function(creep) {
        return  race.getRace(creep) === gc.RACE_HARVESTER
            && (creep.memory.state === gc.STATE_HARVESTER_BUILD
                || creep.memory.state === gc.STATE_HARVESTER_REPAIR
                || creep.memory.state === gc.STATE_HARVESTER_TRANSFER
                || creep.memory.state === gc.STATE_HARVESTER_HARVEST
                || ( creep.memory.state === gc.STATE_MOVE_POS
                    && creep.memory.next_state === gc.STATE_HARVESTER_HARVEST))
    },

    atUpgradingPost: function(pos) { // done
        const flag = Game.flags[Game.rooms[pos.roomName].controller.id];
        const posts = flag.memory.upgraderPosts;
        for (let post of posts) {
            if (pos.x === post.x && pos.y === post.y){
                return true;
            }
        }
        return false;
    },

    findFreeUpgraderPost: function(room) { // done
        const containers = Game.flags[room.controller.id].memory.upgraderPosts;
        if (!containers) {
            return undefined;
        }
        for ( let container of containers) {
            for (let post of container.posts) {
                if (this.isUpgraderPostFree(post, room.name)) {
                    return post;
                }
            }
        }
        return undefined;
    },

    isUpgraderPostFree: function (pos, roomName) { // done
        for (let j in Game.creeps) {
            if (this.isUpgradingHarvester(Game.creeps[j])) {
                 if (Game.creeps[j].memory.targetPos.x === pos.x
                    && Game.creeps[j].memory.targetPos.y === pos.y
                    && Game.creeps[j].room.name === roomName) {
                     return false;
                }
            }
        }
        return true;
    },

    isUpgradingHarvester: function(creep) { // done
        return  race.getRace(creep) === gc.RACE_HARVESTER
                && (creep.memory.state === gc.STATE_UPGRADER_UPGRADE
                || creep.memory.state === gc.STATE_UPGRADER_WITHDRAW
                || ( creep.memory.state === gc.STATE_MOVE_POS
                    && creep.memory.next_state === gc.STATE_UPGRADER_UPGRADE))
    },

    findUpgradeContainerNear : function (creep) {
        const structs = creep.room.lookForAtArea(
            LOOK_STRUCTURES,
            creep.pos.y-range,
            creep.pos.x-range,
            creep.pos.y+range,
            creep.pos.x+range,
            true,
        );
        for (let struct in structs) {
            if (struct.structureType === STRUCTURE_CONTAINER) {
                return struct;
            }
        }
        return undefined;
    },

    findUpgradeContainerToFill : function(room) {
        const containerPoss = Game.flags[room.controller.id].memory.upgraderPosts;
        if (!containerPoss) {
            return undefined;
        }
        const container1 = this.findContainerAt(containerPoss[0].pos);
        const container2 = this.findContainerAt(containerPoss[1].pos);
        if (container1.store.getFreeCapacity(RESOURCE_ENERGY) >
            container2.store.getFreeCapacity(RESOURCE_ENERGY)) {
            return container1;
        } else {
            return container2;
        }
    },

    creepSay: {
        STATE_EMPTY_IDLE: "empty ?",
        STATE_MOVE_PATH: "move",
        STATE_HARVEST: "harvest",
        STATE_FULL_IDLE: "full ?",
        STATE_BUILD: "build",
        STATE_PORTER: "transport",
        STATE_UPGRADE: "upgrade",
        STATE_WORKER_UPGRADE: "upgrade",
        STATE_REPAIR: "repair",
        STATE_HARVESTER_IDLE: "full",
        STATE_HARVESTER_BUILD: "build",
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

    findNextSourceContainer : function (creep) {
        console.log("findNextSourceContainer room energyAvailable",creep.room.energyAvailable,
            "room energyCapacityAvailable", creep.room.energyCapacityAvailable);
        if (creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
            console.log("findNextSourceContainer room at capacity");
            return undefined;
        }

        const nextSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        if (nextSpawn && nextSpawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            console.log("findNextSourceContainer next spawn", nextSpawn.name,"energy capacity", nextSpawn.store.getFreeCapacity(RESOURCE_ENERGY));
            return nextSpawn
        }

        const nextSourceContainer = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(structure)  {
                return ((structure.structureType === STRUCTURE_TOWER
                    && structure.store[RESOURCE_ENERGY]
                    < structure.store.getCapacity(RESOURCE_ENERGY)
                    * gc.TOWER_REFILL_THRESHOLD)
                    || structure.structureType === STRUCTURE_EXTENSION )
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (nextSourceContainer) {
            console.log("findNextSourceContainer container type", nextSourceContainer.type);
            return nextSourceContainer;
        }
        console.log("findNextSourceContainer dropped though closest spawn", creep.pos.findClosestByRange(FIND_MY_SPAWNS).name)
        //return creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    }
};

module.exports = state;

































