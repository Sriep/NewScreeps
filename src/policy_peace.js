/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const economy = require("economy");
const role = require("role");
const construction = require("construction");

const PEACE_BUILD_INTERVAL = 1;

function Policy  (data) {
    //console.log("new policy peace", JSON.stringify(data))
    this.type = gc.POLICY_PEACE;
    if (data) {
        this.id = data.id;
        this.roomId = data.roomId;
    }
}

Policy.prototype.enact = function () {
    this.build()
    this.spawn()
}

Policy.prototype.spawn = function () {
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
                //console.log("maxCreepsCanFitRoundSources", economy.sourceAccessPointsRoom(room), "num creeps", creepCount);
                if (creepCount < economy.sourceAccessPointsRoom(room)) {
                    //console.log("spawn creep energy capacity", Game.rooms[this.roomId].energyCapacityAvailable);
                    role.spawnWorker(spawns[spawn], this);
                }
            }
        }
    }
}

Policy.prototype.build = function () {
    const room = Game.rooms[this.roomId];
    const rcl = room.controller.level
    console.log("policy build rcl", rcl)
    if (Memory.policies[this.id].rcl === room.controller.level) {
        if (Game.time % PEACE_BUILD_INTERVAL !== 0) {
            return
        }
    } else {
        Memory.policies[this.id].rcl = rcl;
    }
    console.log("policy build about to call buildMissingExtensions")
    construction.buildMissingExtensions(room, rcl);
}

module.exports = Policy;