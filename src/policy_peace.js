/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const economy = require("economy");
const race = require("race");
const construction = require("construction");
const state = require("state");
const race_harvester = require("race_harvester");
const budget = require("budget");
const race_porter = require("race_porter");



function Policy  (data) {
    this.type = gc.POLICY_PEACE;
    if (!data) {
        return gf.fatalError("create Policy peace with no data");
    }
    this.id = data.id;
    this.roomId = data.roomId;
}

Policy.prototype.initilise = function () {
    console.log("in policiy initilise", this.id);
    if (!Memory.policies[this.id].initiatives) {
        Memory.policies[this.id].initiatives = []
    }
    if (!Memory.policies[this.id].rcl) {
        Memory.policies[this.id].rcl = Game.rooms[this.roomId].controller.level;
    }
}

Policy.prototype.enact = function () {
    //console.log("activity index", Memory.policies[this.id].activityIndex);
    //let activity = gc.BUILD_ORDER_RCL[Memory.policies[this.id].rcl][Memory.policies[this.id].activityIndex];
    //console.log("activity", activity);

    //console.log("enact policy id",this.id,"room",this.roomId, "memory polices", JSON.stringify(Memory.policies));
    //console.log("enact policy id",this.id,"room",this.roomId, "memory polices", Memory.policies[this.id]);
    //console.log("enact policy id", this.id);
    this.build();
    const initiatives = Memory.policies[this.id].initiatives;
    //console.log("initiatives", JSON.stringify(initiatives));

    const room = Game.rooms[this.roomId];
    const avaliable = room.energyAvailable;
    const maxCapacity = room.energyCapacityAvailable
    console.log("spawn energy",avaliable, "room capacity",  maxCapacity)
    if (avaliable === maxCapacity) { // todo can be done better
        if (initiatives.includes(gc.INITIATIVE_HARVESTER)) { // todo smarten up logic
            this.spawn();
        } else {
            this.spawnWorkers();
        }
    }
}

Policy.prototype.spawn = function () {
    //console.log("in spawn policypeace", this.id)
    const room = Game.rooms[this.roomId];
    const spawns = room.find(FIND_MY_SPAWNS);
    for (let spawn in spawns) {
        if (spawns[spawn].spawning === null) {
            if (!this.doNextSpawn(spawns[spawn])) {
                return;
            }
        }
    }
}

Policy.prototype.spawnWorkers = function () {
    //console.log("in spawnWorkers policy", this.id)
    const room = Game.rooms[this.roomId];
    const spawns = room.find(FIND_MY_SPAWNS);
    for (let spawn in spawns) {
        if (spawns[spawn].spawning === null) {
            //console.log("porterShortfall",economy.porterShortfall(this))
            if (0 < economy.porterShortfall(this)) {
                let creepCount = 0;
                //const policyId = this.id;
                for (let creep in Game.creeps) {
                    if (Game.creeps[creep].memory.policyId === this.id)
                        creepCount++;
                }
                //console.log("creep count", creepCount, "accesspoints", economy.totalSourceAccessPointsRoom(room))
                if (creepCount < economy.totalSourceAccessPointsRoom(room)) {
                    race.spawnWorker(spawns[spawn], this.id);
                }
            }
        }
    }
}

Policy.prototype.doNextSpawn = function (spawn) {
    //console.log("in doNextSpawn")
    const spawnRace = this.getLocalSpawn()
    if (spawnRace) {
        race.spawnCreep(spawn, this.id, spawnRace);
        return true;
    }
    // todo foreign spawns
    return false;
}

Policy.prototype.getLocalSpawn = function () {
    //console.log("in getLocalSpawn")
    const room = Game.rooms[this.roomId];
    const policyId = this.id;
    let hLife = 0, pLife = 0, wLife = 0, workers = 0, harvesters = 0, porters=0;
    const creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
    });

    //console.log("num creeps", Object.getOwnPropertyNames(Game.creeps).length)
    //console.log("creeps policy", creeps.length, "all creeps length", )
    for (let i in creeps) {
        switch (race.getRace(creeps[i])) {
            case gc.RACE_HARVESTER:
                hLife += creeps[i].ticksToLive;
                harvesters++;
                break;
            case gc.RACE_PORTER:
                pLife += creeps[i].ticksToLive;
                porters++;
                break;
            case gc.RACE_WORKER:
                wLife += creeps[i].ticksToLive;
                workers++;
                break;
        }
    }

    //console.log("hLife", hLife, "pLife", pLife, "wLife", wLife)
    console.log("workers", workers, "harvesters",harvesters,"poerters",porters)

    //console.log("initiatives", JSON.stringify(Memory.policies[policyId].initiatives));
    //console.log("check workers");
     if (Memory.policies[policyId].initiatives.includes(gc.INITIATIVE_WORKER)) {
        //console.log("checking workers");
        const buildTicksNeeded = economy.constructionLeft(room) / BUILD_POWER;
        //console.log("constructionLeft", economy.constructionLeft(room));
        //console.log("wLife", wLife, "buildTicksNeeded", buildTicksNeeded, "workers", workers);
        if (wLife < buildTicksNeeded || workers === 0) {
            //console.log("workers", 1, "access pts", economy.totalSourceAccessPointsRoom(room));
            if (workers === 0 || workers <= economy.totalSourceAccessPointsRoom(room)) {
                //console.log("spawn worker");
                return gc.RACE_WORKER;
            }
        }
    }

    const PCs = race_porter.bodyCounts(room.energyCapacityAvailable)[CARRY] // todo hacky

    let maxHarvesterWs = 0;
    if (Memory.policies[policyId].initiatives.includes(gc.INITIATIVE_HARVESTER)) {
        maxHarvesterWs += budget.harvesterWsRoom(room, room);
    }
    if (Memory.policies[policyId].initiatives.includes(gc.INITIATIVE_PORTER)) {
        let maxEnergy = 3000 * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME)
        maxEnergy -= 2 * maxHarvesterWs * 125 + PCs * 75 + 100; // todo fix quick hack
        maxHarvesterWs += budget.upgradersWsRoom(room, maxEnergy)
    }
    const Hws = race_harvester.bodyCounts(room.energyCapacityAvailable)[WORK]
    //console.log("harvesters", harvesters, "maxharvestres",Math.ceil(maxHarvesterWs/Hws), "maxHarvestersWs", maxHarvesterWs, "Hws", Hws,)
    if (harvesters < Math.ceil(maxHarvesterWs/Hws)) {
        return gc.RACE_HARVESTER
    }

    //console.log("check porters");
    if (Memory.policies[policyId].initiatives.includes(gc.INITIATIVE_PORTER)) {
        //console.log("checking porters");

        //console.log("estimatePorters", budget.portersCsRoom(room, room), "Porter Cs")
        if (porters < budget.portersCsRoom(room, room) / PCs) {
            //console.log("spawn porter")
            return gc.RACE_PORTER
        }
    }

    //console.log("no builds")
    return undefined;
}

Policy.prototype.build = function () {
    const room = Game.rooms[this.roomId];

    if (Memory.policies[this.id].rcl !== room.controller.level
        || !Memory.policies[this.id].activityIndex) {
        Memory.policies[this.id].rcl = room.controller.level;
        Memory.policies[this.id].activityIndex = 0;
    } else if (Game.time % gc.BUILD_QUEUE_CHECK_RATE !== 0) {
        return;
    }
    this.actionActivityQueue(room);
}

Policy.prototype.actionActivityQueue = function (room) {
    const rcl = room.controller.level;
    gf.assert(rcl, Memory.policies[this.id].rcl, "rcl mismatch")
    //console.log("gc.BUILD_ORDER_RCL", JSON.stringify(gc.BUILD_ORDER_RCL))
    //console.log("memory rcl",Memory.policies[this.id].rcl);

    if (!Memory.policies[this.id].rcl) {
        Memory.policies[this.id].rcl = room.controller.level;
    }
    if (!Memory.policies[this.id].activityIndex) {
        Memory.policies[this.id].activityIndex = 0;
    }

    //console.log("memory rcl activity", gc.BUILD_ORDER_RCL[Memory.policies[this.id].rcl][Memory.policies[this.id].activityIndex]);
    //console.log("activity index", Memory.policies[this.id].activityIndex);
    //console.log("gc.BUILD_ORDER_RCL[1][0]",gc.BUILD_ORDER_RCL[1][0] )
    let activity = gc.BUILD_ORDER_RCL[Memory.policies[this.id].rcl][Memory.policies[this.id].activityIndex];
    console.log("activity", activity);
    //const fg = this.buildFcs()
    //console.log("buildfcs", JSON.stringify(fg))
    //console.log("buildfcs worker", JSON.stringify(fg["worker"]), " fc[gc.BUILD_ROAD_SPAWN_CONTROLLER]",  fg[gc.BUILD_ROAD_SPAWN_CONTROLLER])
    if (this.buildFcs()[activity].check(room, activity, this.id)) {
        console.log("checked", activity, "result TRUE")
        Memory.policies[this.id].activityIndex++;
        this.actionActivityQueue(room);
    } else {
        console.log("checked", activity, "result FALSE")
        this.buildFcs()[activity].build(room, activity, this.id);
    }
}

Policy.prototype.buildFcs = function () {
    fc = {};

    fc[gc.BUILD_ROAD_SPAWN_CONTROLLER] = {
        "build": construction.buildRoadSpawnController,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_CONTROLLER] = {
        "build": construction.buildRoadSourceController,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_SOURCE] = {
        "build": construction.buildRoadSources,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_SPAWN] = {
        "build": construction.buildRoadSourceSpawn,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_EXTENSIONS] = {
        "build": construction.buildRoadSourceExtensions,
        "check": construction.roadsBuilt,
    };

    fc[gc.BUILD_CONTROLLER_CONTAINERS] = {
        "build": buildSourceContainers,
        "check": areSourceContainersFinished,
    };
    fc[gc.BUILD_SOURCE_CONTAINERS] = {
        "build": buildControllerContainer,
        "check": isControllerContainerFinished,
    };

    fc[gc.BUILD_EXTENSIONS] = {
        "build": construction.finishBuildingMissingExtensions,
        "check": construction.finishBuildingMissingExtensions
    };

    newInititive = {
        "build": newEconomicInititive,
        "check": checkInitiative,
    };
    fc[gc.INITIATIVE_WORKER] = newInititive;
    fc[gc.INITIATIVE_HARVESTER] = newInititive;
    fc[gc.INITIATIVE_PORTER] = newInititive;
    fc[gc.INITIATIVE_UPGRADER] = newInititive;

    fc[gc.ACTIVITY_FINISHED]  = {
        "build": function(){},
        "check": function(){ return true; },
    }
    return fc;
}

newEconomicInititive = function (room, activity, policyId)  {
    if (!Memory.policies[policyId].initiatives.includes(activity)) {
        Memory.policies[policyId].initiatives.push(activity);
    }
}

checkInitiative = function (room, activity, policyId)  {
    console.log("in checkInitiative")
    //console.log("room", room.name, "activity", activity, "this.id", policyId)
    //console.log("Memory.policies[policyId]", JSON.stringify(Memory.policies[policyId]));
    //console.log("initiatives", JSON.stringify(Memory.policies[policyId].initiatives));

    if (!Memory.policies[policyId].initiatives) {
        Memory.policies[policyId].initiatives = []
        return false;
    }
    //console.log("checkInitiative rtv", Memory.policies[policyId].initiatives.includes(activity));
    return Memory.policies[policyId].initiatives.includes(activity);
}

isControllerContainerFinished = function (room) {
    const flag = Game.flags[room.controller.id];
    if (!flag.memory.container) {
        return false;
    }
    return undefined !== state.findContainerAt(new RoomPosition(flag.memory.container));
}

buildControllerContainer = function (room) {
    const controllerFlag = Game.flags[room.controller.id];
    if (controllerFlag.memory.container) {
        return;
    }
    let spots = economy.findMostFreeNeighbours(
        room, room.controller.pos, 2
    )
    if (spots.length === 0) {
        return gf.fatalError("findMostFreeNeighbours cant get to controller");
    }

    controllerFlag.memory.upgraderPosts = spots[0].neighbours;
    spots[0].pos.roomName = room.name;
    controllerFlag.memory.containerPos = spots[0].pos;
    if (state.findContainerOrConstructionAt(gf.roomPosFromPos(spots[0].pos))) {
        return;
    }
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        console.log("spot", JSON.stringify(spots[0]));
        gf.fatalError("controller container construction failed " + result.toString());
    }
}

areSourceContainersFinished = function (room) {
    //console.log("in areSourceContainersFinished")
    const sources = room.find(FIND_SOURCES);
    for (let i in sources) {
        const flag = Game.flags[sources[i].id];
        if (!flag.memory.container) {
            return false
        }
        //console.log("areSourceContainersFinished flag", JSON.stringify(flag.memory.container))
        const container = state.findContainerAt(gf.roomPosFromPos(flag.memory.container))
        //console.log("areSourceContainersFinished container", JSON.stringify(container))
        if (!container) {
            return false;
        }
    }
    return true;
}

buildSourceContainers = function (room) {
    //console.log("in buildSourceContainers")
    const sources = room.find(FIND_SOURCES);
    for (let i in sources) {
        const flag = Game.flags[sources[i].id];
        //console.log("buildSourceContainers flag", JSON.stringify(flag.memory))
        if (!flag.memory.containerPos) {
            buildSourceContainer(sources[i], flag);
        }
    }
}

buildSourceContainer = function (source, flag) {
    //console.log("in buildSourceContainer no es")

    let spots = economy.findMostFreeNeighbours(
        source.room, source.pos, 1
    )
    //console.log("buildSourceContainer spots", JSON.stringify(spots))
    if (spots.length === 0) {
        return gf.fatalError("findMostFreeNeighbours cant get to source");
    }
    flag.memory.harvesterPosts = spots[0].neighbours;
    spots[0].pos.roomName = source.room.name;
    flag.memory.containerPos = spots[0].pos;
    if (state.findContainerOrConstructionAt(gf.roomPosFromPos(spots[0].pos))) {
        return;
    }
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        console.log("spot", JSON.stringify(spots[0]));
        gf.fatalError("construction failed " + result.toString(),"pos", JSON.stringify(spots[0].pos));
    }
}

module.exports = Policy;
































