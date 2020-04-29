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
    this.build();
    this.spawn();
    //this.spawnDepreciated();
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
        //console.log("workers", 1, "access pts", economy.sourceAccessPointsRoom(room));
        if (workers === 0 || workers <= economy.sourceAccessPointsRoom(room)) {
            //console.log("spawn worker");
            return gc.RACE_WORKER;
        }
    }
    //console.log("rpc", gc.RPC_HARVESTERS[room.controller.level])
    if (harvesters < economy.estimateHomeHarvesters(room)) {
        //console.log("spawn harvesters")
        return gc.RACE_HARVESTER
    }

    //console.log("estimatePorters", economy.estimateHomePorters(room))
    if (porters < economy.estimateHomePorters(room)) {
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
    const rcl = room.controller.level
    //console.log("policy build rcl", rcl)
    if (Memory.policies[this.id].rcl === room.controller.level) {
        if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
            return
        }
    }

    const controllerFlag = Game.flags[room.controller.id];
    let ccPos = controllerFlag.memory.container;
    if (!ccPos) {
        let spots = economy.findMostFreeNeighbours(
            room, room.controller.pos, 2
        )
        console.log("spots", JSON.stringify(spots))
        if (spots.length === 0) {
            return gf.fatalError("findMostFreeNeighbours return no spots");
        }
        let bestIndex = 0;
        if (spots.length > 1) {
            //console.log("spots length", spots. length);
            const spawns = room.find(FIND_MY_SPAWNS)
            let bestSoFar = 9999;
            // todo this bit is expensive so maybe check cpu?
            for (let i in spots) {
                const pathLength = spots[i].findPathTo(spawns[0].pos).length
                //console.log("i", i, "spots", JSON.stringify(spots[i]), "length", pathLength)
                if (pathLength < bestSoFar) {
                    bestIndex = i;
                    bestSoFar = pathLength;
                }
            }
            //console.log("bestIndex", bestIndex)
            ccPos = new RoomPosition(spots[bestIndex].x, spots[bestIndex].y, room.name);
            controllerFlag.memory.container = ccPos;
        }

        //console.log("controler flag memory", JSON.stringify(controllerFlag.memory))
        const result = ccPos.createConstructionSite(STRUCTURE_CONTAINER);
        if (result !== OK) {
            gf.fatalError("construction failed " + result.toString())
        }
    }
/* todo decide if I need this
    const sources = room.find(FIND_SOURCES);
    for (let s in sources) {
        const sourceFlag =  Game.flags[room.sources[s].id]
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
    if (rcl >= gc.BUILD_ROAD_SPAWN_CONTROLLER) {
        construction.buildRoadSpawnController(room)
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
                    race.spawnWorker(spawns[spawn], this);
                }
            }
        }
    }
}

module.exports = Policy;
































