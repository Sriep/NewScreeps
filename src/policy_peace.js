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

Policy.prototype.enact = function () {
    //console.log("enact policy id",this.id,"room",this.roomId, "memory polices", JSON.stringify(Memory.policies));
    //console.log("enact policy id",this.id,"room",this.roomId, "memory polices", Memory.policies[this.id]);
    this.build();
    if (!Memory.policies[this.id].economy) {
        Memory.policies[this.id].economy = gc.ECONOMY_WORKER;
        gf.fatalError("no economy for policy", this.id)
    }
    const economy = Memory.policies[this.id].economy

    switch (economy) {
        case gc.ECONOMY_WORKER:
            this.spawnWorkers();
            break;
        case gc.ECONOMY_SPECIALIST:
            this.spawn();
            break;
        default:
            gf.fatalError("unrecognised economy", economy, "policy", this.id);
    }
}

Policy.prototype.spawn = function () {
    //console.log("in spawn policy", this.id)
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
    const spawnRace = this.getLocalSpawn()
    if (spawnRace) {
        race.spawnCreep(spawn, this.id, spawnRace);
        return true;
    }
    // todo foreign spawns
    return false;
}

Policy.prototype.getLocalSpawn = function () {
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
    //console.log("workers", workers, "harvesters",harvesters,"poerters",porters)
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

    //console.log("rpc", gc.RPC_HARVESTERS[room.controller.level])
    //console.log("estermate harvesters economy", economy.estimateHomeHarvesters(room),
    //    "budget", budget.harvesterWsRoom(room, room))
    const Ws = race_harvester.bodyCounts(room.energyCapacityAvailable)[WORK]
   //console.log("Ws",Ws,"energy avaliable",room.energyCapacityAvailable);
    if (harvesters < Math.ceil(budget.harvesterWsRoom(room, room)/Ws)) {
        //console.log("spawn harvesters")
        return gc.RACE_HARVESTER
    }


    const PorterCs = race_porter.bodyCounts(room.energyCapacityAvailable)["CARRY"]
    //console.log("estimatePorters", budget.portersCsRoom(room, room), "Porter Cs")
    if (porters < budget.portersCsRoom(room, room)/PorterCs) {
        //console.log("spawn porter")
        return gc.RACE_PORTER
    }

    if (harvesters < 2*economy.estimateHomeHarvesters(room)) {
        //console.log("spawn harvesters")
        return gc.RACE_HARVESTER
    }

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

    let activityIndex = Memory.policies[this.id].activityIndex
    let activity = gc.BUILD_ORDER_RCL[Memory.policies[this.id].rcl][activityIndex];
    //console.log("activity", activity, "activity index",activityIndex);
    //console.log("BUILD_ORDER_RCL[rcl]", JSON.stringify(gc.BUILD_ORDER_RCL[Memory.policies[this.id].rcl]))
    switch (activity.substring(0, 5)) {
        case "build": {
            if (this.buildFcs()[activity].check(room)) {
                //console.log("switch check build trueactivityIndex1",activityIndex)
                activityIndex++;
                //console.log("activityIndex2",activityIndex)
                Memory.policies[this.id].activityIndex = activityIndex;
                this.actionActivityQueue(room);
            } else {
                //console.log("switch check build failed activity",activity)
                this.buildFcs()[activity].build(room);
            }
            //console.log("activity idex after",activityIndex)
            break;
        }
        case "econo":
            //console.log("switch econo")
            Memory.policies[this.id].economy = activity;
            //console.log("activityIndex3",activityIndex)
            activityIndex++;
            //console.log("activityIndex4",activityIndex)
            Memory.policies[this.id].activityIndex = activityIndex;
            this.actionActivityQueue(room);
            break;
        case "finis":
            break;
        default:
            gf.fatalError("unrecognised activity", activity);
    }
    //console.log("activity index after",activityIndex, "memory", JSON.stringify(Memory.policies[this.id]))
}

Policy.prototype.buildFcs = function () {
    return  {
        "build_extensions": {
            "build": construction.finishBuildingMissingExtensions,
            "check": construction.finishBuildingMissingExtensions
        },
        "build_controller_containers": {
            "build": this.buildControllerContainer,
            "check": this.isControllerContainerFinished,
        },
        "build_source_containers": {
            "build": buildSourceContainers,
            "check": areSourceContainersFinished,
        },
        "build_road_source_spawn": {
            "build": construction.buildRoadSourceSpawn,
            "check": construction.roadsBuilt,
        },
        "build_road_source_controller": {
            "build": construction.buildRoadSourceController,
            "check": construction.roadsBuilt,
        },
        "build_road_spawn_controller": {
            "build": construction.buildRoadSpawnController,
            "check": construction.roadsBuilt,
        },
        "build_road_source_source": {
            "build": construction.buildRoadSources,
            "check": construction.roadsBuilt,
        },
        "build_road_source_extension": {
            "build": construction.buildRoadSourceExtensions,
            "check": construction.roadsBuilt,
        },
    };
}

Policy.prototype.isControllerContainerFinished = function (room) {
    const flag = Game.flags[room.controller.id];
    if (!flag.memory.container) {
        return false;
    }
    return undefined !== state.findContainerAt(new RoomPosition(flag.memory.container));
}

Policy.prototype.buildControllerContainer = function (room) {
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
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        gf.fatalError("construction failed " + result.toString())
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
    console.log("in buildSourceContainers")
    const sources = room.find(FIND_SOURCES);
    for (let i in sources) {
        const flag = Game.flags[sources[i].id];
        //console.log("flag", JSON.stringify(flag.memory))
        if (!flag.memory.container) {
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
    if (findContainerConstructionAt(spots[0].pos)) {
        return;
    }
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        gf.fatalError("construction failed " + result.toString(),"pos", JSON.stringify(spots[0].pos))
    }
}

module.exports = Policy;
































