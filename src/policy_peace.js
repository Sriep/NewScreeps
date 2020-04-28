/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const economy = require("economy");
const race = require("race");
const construction = require("construction");

function Policy  (data) {
    this.type = gc.POLICY_PEACE;
    if (data) {
        this.id = data.id;
        this.roomId = data.roomId;
    }
}

Policy.prototype.enact = function () {
    this.build()
    this.spawnDepreciated()
}

Policy.prototype.spawn = function () {
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

Policy.prototype.doNextSpawn = function (spawn) {
    const spawnRace = this.getLocalSpawn()
    if (spawnRace) {
        race.spawnCreep(spawn, this.id, spawnRace, gc.STATE_EMPTY_IDLE);
        return true;
    }
    // todo foreign spawns
    return false;
}

Policy.prototype.getLocalSpawn = function () {
    const room = Game.rooms[this.roomId];
    let hLife = 0, pLife = 0, wLife = 0, workers = 0, harvesters = 0;
    const creeps = _.filter(Game.creeps, function (creep) {
        return creep.memory.policyId === this.id
    });
    for (let i in creeps) {
        switch (race.getRace(creeps[i])) {
            case gc.RACE_HARVESTER:
                hLife += creeps[i].ticksToLive;
                harvesters++;
                break;
            case gc.RACE_PORTER:
                pLife += creeps[i].ticksToLive;
                break;
            case gc.RACE_WORKER:
                wLife += creeps[i].ticksToLive;
                workers++;
                break;
        }
    }
    console.log("hLife", hLife, "pLife", pLife, "wLife", wLife)
    console.log("workers", workers, "harvesters",harvesters)
    const buildTicksNeeded = economy.constructionLeft(room) / BUILD_POWER;
    console.log("buildTicksNeeded", buildTicksNeeded)
    if (wLife < buildTicksNeeded || workers === 0) {
        if (workers > 1 && workers <= economy.sourceAccessPointsRoom(room))
        return gc.RACE_WORKER;
    }

    if (harvesters < gc.RPC_HARVESTERS[room.controller.level]) {
        return gc.RACE_HARVESTER
    }
    console.log("estimatePorters", economy.estimatePorters(room))
    if (porters < economy.estimatePorters(room)) {
        return gc.RACE_PORTER
    }


    if (harvesters < 3*gc.RPC_HARVESTERS[room.controller.level]) {
        return gc.RACE_HARVESTER
    }

    return undefined;
}

Policy.prototype.build = function () {
    const room = Game.rooms[this.roomId];
    const rcl = room.controller.level
    console.log("policy build rcl", rcl)
    if (Memory.policies[this.id].rcl === room.controller.level) {
        if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
            return
        }
    }

    const controllerFlag = Games.flags[room.contoller.id];
    ccPos = controllerFlag.memory.container
    console.log("controler flag memory", JSON.stringify(controllerFlag.memory))
    if (!ccPos) {
        const spots = economy.findMostFreeNeighbours(
            room, room.controller.pos, 2
        )
        ccPos = new RoomPosition(spots[0].x, spots[0].y, room.name);
        controllerFlag.memory.container = ccPos;
        const result = ccPos.createConstructionSite(STRUCTURE_CONTAINER);
        if (result !== OK) {
            gf.fatalError("construction failed " + result.toString())
        }
    }
/* todo decide if I need this
    const sources = room.find(FIND_SOURCES);
    for (let s in sources) {
        const sourceFlag =  Games.flags[room.sources[s].id]
        scPos = sourceFlag.memory.container
        if (!scPos) {
            const spots = economy.findMostFreeNeighbours(
                room, room.source[s].pos, 1
            )
            sourceFlag.memory.container = ccPos;
            const result = scPos.createConstructionSite(STRUCTURE_CONTAINER);
        }
    }
*/
    if (rcl >= gc.BUILD_ROAD_SOURCE_SPAWN) {
        construction.buildRoadSourceSpawn(room)
    }
    if (rcl >= gc.BUILD_ROAD_SOURCE_CONTROLLER) {
        construction.buildRoadSourceController(room)
    }
    if (rcl >= gc.BUILD_ROAD_SOURCE_EXTENSIONS) {
        construction.buildRoadSourceExtensions(room)
    }
    if (rcl >= gc.BUILD_ROAD_SOURCE_SOURCE) {
        construction.buildRoadSources(room)
    }
    construction.buildMissingExtensions(room, rcl);
    Memory.policies[this.id].rcl = rcl;
}

Policy.prototype.spawnDepreciated = function () {
    const room = Game.rooms[this.roomId];
    const spawns = room.find(FIND_MY_SPAWNS);
    for (let spawn in spawns) {
        if (spawns[spawn].spawning === null) {
            if (0 < economy.porterShortfall(this)) {
                let creepCount = 0;
                for (let creep in Game.creeps) {
                    if (Game.creeps[creep].memory.policyId === this.id)
                        creepCount++;
                }
                if (creepCount < economy.sourceAccessPointsRoom(room)) {
                    role.spawnWorker(spawns[spawn], this);
                }
            }
        }
    }
}


module.exports = Policy;
































