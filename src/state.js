/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const economy = require("economy");
const race = require("race");
const cache = require("cache");

const state = {

    stackDepth: 0,

    enactCreep : function(creep) {
        this.stackDepth = 0;
        this.enact(creep, true)
    },

    enact : function(creep) {
        if (this.stackDepth > gc.MAX_STATE_STACK) {
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
        const requireString = "state_" + creep.memory.state;
        const stateConstructor = require(requireString);
        const creepState = new stateConstructor(creep);
        creepState.enact()
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
        return state.enact(creep);
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

    //--------------------- state switches end----------------------------------

    countHarvesterPosts: function(room) {
        const sources = room.find(FIND_SOURCES);
        let posts = 0;
        for (let source of sources) {
            if (state.getSourcePosts(source.id)) {
                posts += state.getSourcePosts(source.id).length;
            }
        }
        return posts;
    },

    //------------ nextFreeHarvesterPost----------------------------------------

    nextFreeHarvesterPost : function (home, colonies, ec) {
        const spawnRoom = Game.rooms[home];
        for (let colonyObj of colonies) {
            for (let sourceId in Game.flags[colonyObj.name].memory.sources) {
                const post = this.freeHarvesterPost(sourceId, spawnRoom, ec);
                //console.log("nextFreeHarvesterPost freeHarvesterPost", post);
                if (post) {
                    return {
                        "sourceId": sourceId,
                        "post": new RoomPosition(post.x, post.y, colonyObj.name),
                    };
                }
            }
        }
        //console.log("nextFreeHarvesterPost dropped though, extrta rounding error harvester");
        const creeps = _.filter(Game.creeps, c =>
            c.memory.targetId && race.getRace(c) === gc.RACE_HARVESTER
        );
        let leastLife = 9999999;
        let bestPost, bestSourceId;
        let colony;
        for (let colonyObj of colonies) {
            for (let sourceId in Game.flags[colonyObj.name].memory.sources) {
                const sPosts = state.getSourcePosts(sourceId);
                const sPost = this.findFreePostIfPossable(creeps, sPosts);
                if (!sPost ) {
                    continue;
                }
                let lifeCreepsSource = 0;
                const sourceCreeps = _.filter(creeps, c=> c.memory.targetId === sourceId);
                for (let sc of sourceCreeps) {
                    lifeCreepsSource += sc.ticksToLive;
                }
                //console.log("nextFreeHarvesterPost dropped before, lifeCreepsSource"
                //    ,lifeCreepsSource,"leastLife",leastLife,"bestPost",JSON.stringify(sPost));
                if (lifeCreepsSource < leastLife) {
                    leastLife = lifeCreepsSource;
                    bestPost = sPost;
                    bestSourceId = sourceId;
                    colony = colonyObj.name
                }
                //console.log("nextFreeHarvesterPost dropped after, lifeCreepsSource"
                //    ,lifeCreepsSource,"leastLife",leastLife)
            }
        }
        return {
            "sourceId": bestSourceId,
            "post": new RoomPosition(bestPost.x, bestPost.y, colony),
        };
    },

    freeHarvesterPost : function (sourceId, spawnRoom, ec) {
        const posts = state.getSourcePosts(sourceId);
        const creeps = _.filter(Game.creeps, c =>
            c.memory.targetId === sourceId
            && race.getRace(c) === gc.RACE_HARVESTER
        );
        if (creeps.length === 0) {
            return posts[0];
        }
        const maxHEc = this.maxHEc(ec);
        //console.log("freeHarvesterPost ec", ec, "maxHEc", maxHEc);
        //console.log(sourceId, "sourceid creeps.length", creeps.length, "posts", JSON.stringify(posts));
        if (creeps.length > maxHEc) {
            console.log("freeHarvesterPost return false1");
            return false;
        }
        if (maxHEc === 1) {
            const source = Game.getObjectById(sourceId);
            if (!source) {
                return false;
            }
            const distance = cache.distanceSourceSpawn(source, spawnRoom);
            if (creeps[0].ticksToLive < distance + gc.ASSIGN_HARVESTER_BUFFER) {
                return this.findFreePostIfPossable(creeps, posts);
            } else {
                //console.log("freeHarvesterPost return false2");
                return false;
            }
        }
        if (creeps.length < maxHEc) {
            return this.findFreePostIfPossable(creeps, posts);
        }
        return false;
    },

    findFreePostIfPossable : function (creeps, posts) {
        //console.log("findFreePostIfPossable creep lenght", creeps.length, "posts", JSON.stringify(posts))
        for (let post of posts) {
            let taken = false;
            for (let creep of creeps) {
                if (creep.pos.x === post.x && creep.pos.y === post.y) {
                    taken = true;
                    break;
                }
            }
            if (!taken) {
                return post;
            }
        }
        return false;
    },

    //------------ nextFreeHarvesterPost ---------------------------------------
    //------------ nextCollectContainer ----------------------------------------
    //
    findPorterSourceContainer: function(spawnRoom, colonies, ec) {
        const porterCC = race.getBodyCounts(gc.RACE_PORTER, ec)["carry"] * 75;
        const porters = _.filter(Game.creeps, c => {
            return race.getRace(c) === gc.RACE_PORTER
                && c.memory.state === gc.STATE_MOVE_POS
                && c.memory.state === gc.STATE_PORTER_TRANSFER
        });
        //console.log("findPorterSourceContainer colonies",JSON.stringify(colonies));
        const containersInfo = this.listSourceContainers(colonies);
        //console.log("findPorterSourceContainer containersInfo before", JSON.stringify(containersInfo));

        for (let info of containersInfo) {
            const tripsPerLifetimePerPorter = CREEP_LIFE_TIME / (2 * info.distance);
            const fPorters = porters.filter(p =>
                p.memory.targetPos.x === info.pos.x
                && p.memory.targetPos.y === info.pos.y
            );
            containersInfo["tripsLT"] = fPorters.length * tripsPerLifetimePerPorter;
            info["tripsLT"] = porters.filter(p =>
                p.memory.targetPos.x === info.pos.x
                && p.memory.targetPos.y === info.pos.y
            ).length * tripsPerLifetimePerPorter;
        }
        containersInfo.sort((c1, c2) => c1.tripsLT - c2.tripsLT);
        if (containersInfo[0].tripsLT * porterCC >= gc.SORCE_REGEN_LT * SOURCE_ENERGY_CAPACITY) {
            return;
        }
        //console.log("findPorterSourceContainer1 containersInfo after", JSON.stringify(containersInfo));
        for (let info of containersInfo) {
            const harvesters = _.filter(Game.creeps, c => {
                return c.memory.targetId === info.sourceId
                    && race.getRace(c) === gc.RACE_HARVESTER
            });

            if (harvesters.length !== 0) {
                const source = Game.getObjectById(info.sourceId);
                if (source && source.energy > 0 && source.ticksToRegeneration <= info.distance) {
                    return info;
                }
            }
        }
        //console.log("findPorterSourceContainer2 containersInfo after", JSON.stringify(containersInfo));

        let maxEnergySoFar = 0;
        let fullestContainer;
        for (let info of containersInfo) {
            //console.log("findPorterSourceContainer2 info", JSON.stringify(info));
            //console.log("findPorterSourceContainer3 info.pos.roomName",JSON.stringify(info.pos.roomName));
            const cRoom = Game.rooms[info.pos.roomName];
            //console.log("findPorterSourceContainer cRoom",cRoom.name);
            if (cRoom) {
                //console.log("findPorterSourceContainer2 info.pos.x",info.pos.x,"info.pos.y",info.pos.y,"info.roomName",info.pos.roomName);
                const container  = state.findContainerAt(new RoomPosition(info.pos.x, info.pos.y, info.pos.roomName));
                //console.log("findPorterSourceContainer2 container.store.getUsedCapacity", JSON.stringify(container.store.getUsedCapacity(RESOURCE_ENERGY)),
                //    "maxEnergySoFar",maxEnergySoFar);
                if (!container) {
                    continue;
                }
                if (container.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergySoFar) {
                    fullestContainer = container;
                    maxEnergySoFar = container.store.getUsedCapacity(RESOURCE_ENERGY);
                }
            }
        }
        //console.log("findPorterSourceContainer fullestContainer", JSON.stringify(fullestContainer));
        return fullestContainer;
    },

    listSourceContainers : function(colonies) {
        const containerInfo = [];
        //console.log("listSourceContainers colonies", JSON.stringify(colonies));
        for (let colonyObj of colonies) {
            //console.log(colonyObj.name,"listSourceContainers sources", JSON.stringify(Game.flags[colonyObj.name].memory.sources));
            for (let sourceId in Game.flags[colonyObj.name].memory.sources) {
                const cPos = state.getSourceContainer(sourceId);
                //console.log(colonyObj.name,"listSourceContainers cPos", JSON.stringify(cPos), "sourceId", sourceId);
                if (cPos) {
                    let distance = Game.flags[colonyObj.name].memory.sources[sourceId].distance;
                    //console.log(colonyObj.name, "distance",JSON.stringify(Game.flags[colonyObj.name].memory.sources));
                    if (!distance) {
                        distance = 15; // todo fix hack
                    }
                    containerInfo.push({"pos" : cPos, "distance" : distance, "sourceId" : sourceId})
                }
            }
        }
        return containerInfo;
    },


    listSourceContainers2: function(colonies) {
        return  cache.global(
            listSourceContainers,
            "listSourceContainers_" + colonies[0].name,
            [colonies],
            true
        );
    },

    //------------ nextCollectContainer ----------------------------------------
    //------------ findFreeHarvesterPost ---------------------------------------

    findFreeHarvesterPost: function(room) {
        let sources = room.find(FIND_SOURCES);
        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        for (let s in sources) {
            //const flag = Game.flags[sources[s].id];
            //const posts = flag.memory.harvesterPosts;
            const posts = state.getSourcePosts(sources[s].id);
            for (let i in posts) {
                const post = posts[i];
                if (this.isHarvesterPostFree(post, room.name)) {
                    post.source = sources[s];
                    return post;
                }
            }
        }
        return undefined;
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

    isHarvestingHarvester: function(creep) {
        return  race.getRace(creep) === gc.RACE_HARVESTER
            && (creep.memory.state === gc.STATE_HARVESTER_BUILD
                || creep.memory.state === gc.STATE_HARVESTER_REPAIR
                || creep.memory.state === gc.STATE_HARVESTER_TRANSFER
                || creep.memory.state === gc.STATE_HARVESTER_HARVEST
                || ( creep.memory.state === gc.STATE_MOVE_POS
                    && creep.memory.next_state === gc.STATE_HARVESTER_HARVEST))
    },

    //------------ findFreeHarvesterPost ---------------------------------------

    getCreepAt: function(x,y,roomname) {
        for (let j in Game.creeps) {
            const creep = Game.creeps[j].pos;
            if (creep.pos.x === x && creep.pos.y === y && creep.pos.roomName === roomname) {
                return Game.creeps[j]
            }
        }
        return undefined;
    },

    //atHarvestingPostWithUndepletedSourceId: function(pos) {
    atHarvestingPost: function(pos) {
        let sources = Game.rooms[pos.roomName].find(FIND_SOURCES);
        for (let source of sources) {
            //const flag = Game.flags[source.id];
            //if (!flag) { // left room
            //    return false;
            //}
            //const posts = flag.memory.harvesterPosts;
            const posts = state.getSourcePosts(source.id);
            for (let j in posts) {
                if (pos.x === posts[j].x && pos.y ===posts[j].y) {
                    return source.id
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
        const sources = room.find(FIND_SOURCES);
        const containersPos = [];
        for (let source of sources) {
            const cPos = state.getSourceContainer(source.id);
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

    atUpgradingPost: function(pos) { // done
        const posts = state.getControllerPosts(Game.rooms[pos.roomName].controller.id);
        for (let i in posts) {
            if (pos.x === posts[i].x && pos.y === posts[i].y){
                return true;
            }
        }
        return false;
    },

    findFreeUpgraderPost: function(room) { // done
        const upgraderPosts = state.getControllerPosts(room.controller.id);
        let lowestUserCount = 9999;
        let bestPost;
        for ( let i = 0; i < upgraderPosts.length ; i++ ) {
            let users = 0;
            let freePost = undefined;
            for (let post of upgraderPosts[i].posts) {
                //console.log("findFreeUpgraderPost post", JSON.stringify(post));
                if (this.isUpgraderPostFree(post, room.name)) {
                    if (!freePost) {
                        freePost = post;
                    }
                    //console.log("post is free", JSON.stringify(freePost));
                } else {
                    users++;
                    //console.log("findFreeUpgraderPost post is not free", users);
                }
            }
            if (users < lowestUserCount && users < upgraderPosts[i].posts.length) {
                lowestUserCount = users;
                bestPost = freePost;
                //console.log("found lowestUserCount",lowestUserCount,"bestPost",JSON.stringify(freePost));
            }
        }
        //console.log("findFreeUpgraderPost bestSoFar", lowestUserCount, "returning bestPost", JSON.stringify(bestPost));
        return bestPost;
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
        return  (creep.memory.state === gc.STATE_UPGRADER_UPGRADE
            || creep.memory.state === gc.STATE_UPGRADER_WITHDRAW
            || ( creep.memory.state === gc.STATE_MOVE_POS
                && creep.memory.next_state === gc.STATE_UPGRADER_UPGRADE))
    },

    findUpgradeContainerNear : function (creep) {
        const range = 1;
        const structs = creep.room.lookForAtArea(
            LOOK_STRUCTURES,
            creep.pos.y-range,
            creep.pos.x-range,
            creep.pos.y+range,
            creep.pos.x+range,
            true,
        );
        //console.log("findUpgradeContainerNear stucts length", structs.length,"structs", structs)
        for (let struct of structs) {
            //console.log("findUpgradeContainerNear stuct type", struct.structureType, "struct", JSON.stringify(struct));
            if (struct.structure.structureType === STRUCTURE_CONTAINER) {
                return struct.structure;
            }
        }
        return undefined;
    },

    findUpgradeContainerToFill : function(room) {
        const containerPosts = state.getControllerPosts(room.controller.id);
        if (!containerPosts) {
            return undefined;
        }
        let bestContainer;
        let lowestEnergy = 9999;
        for (let info of containerPosts) {
            const pos = new RoomPosition(info.x, info.y, room.name);
            const container = this.findContainerAt(pos);
            if (container
                && container.store[RESOURCE_ENERGY]
                    < container.store.getCapacity(RESOURCE_ENERGY) * gc.REFILL_THRESHOLD
                && container.store[RESOURCE_ENERGY] < lowestEnergy) {
                    bestContainer = container;
                    lowestEnergy = container.store[RESOURCE_ENERGY];
            }
        }
        return bestContainer;
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

    findNextEnergyContainer : function (creep) {
        return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: s =>  {
                return  (s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_SPAWN)
                && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            }
        });
    },

    findNextEnergyStorage : function (creep) {
        return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: s => {
                return (s.structureType === STRUCTURE_TOWER
                || s.structureType === STRUCTURE_STORAGE
                || s.structureType === STRUCTURE_LINK
                || s.structureType === STRUCTURE_TERMINAL
                || s.structureType === STRUCTURE_LAB)
                && (s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY) * gc.REFILL_THRESHOLD)
            }
        })
    },

    maxHEc : function (ec) {
        if (ec <= gc.MAX_EC_2WORK_HARVESTER) {
            return 3;
        } else if (ec <= gc.MAX_EC_4WORK_HARVESTER) {
            return 2;
        }
        return 1;
    },

    getSourcePosts : function (sourceId) {
        if (Game.flags[sourceId]) {
            return Game.flags[sourceId].memory.harvesterPosts;
        }
    },

    getSourceLinkPos : function (sourceId) {
        if (Game.flags[sourceId]) {
            const l = gf.roomPosFromPos(Game.flags[sourceId].memory.linkPos);
            if (l) {
                return new RoomPosition(l.x, l.y, l.roomName);
            }
        }
    },

    getSourceContainer : function (sourceId) {
        if (Game.flags[sourceId]) {
            return Game.flags[sourceId].memory.containerPos;
        }
    },

    getControllerPosts : function (controllerId) {
        if (Game.flags[controllerId]) {
            return Game.flags[controllerId].memory.upgraderPosts;
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













