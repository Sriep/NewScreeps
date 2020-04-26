/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const economy = require("economy");
const role_worker = require("role_worker");

function Policy  (data) {
    //console.log("new policy peace", JSON.stringify(data))
    this.type = gc.POLICY_PEACE;
    if (data) {
        this.id = data.id;
        this.roomId = data.roomId;
    }
}

Policy.prototype.enact = function () {
    console.log("enacting policy peace this", JSON.stringify(this));
    const room = Game.rooms[this.roomId]
    console.log("roomid", this.roomId, "room object", Game.rooms[this.roomId]);

    const spawns = Game.rooms[this.roomId].find(FIND_MY_SPAWNS);
    for (let spawn in spawns) {
         if (spawns[spawn].spawning === null) {
            console.log("run economyPeace nextSpawn", this.roomId, spawn, "porterShortfall", economy.porterShortfall(this));
            if (0 < economy.porterShortfall(this)) {
                const creeps = _.filter(Game.creeps, function (creep) {
                    return creep.memory.policyId === this.id
                        && creep.memory.role === gc.ROLE_WORKER});
                console.log("maxCreepsCanFitRoundSources", economy.maxPortersRoom(room))
                if (creeps.length < economy.maxPortersRoom(room)) {
                    console.log("spawn creep energy capacity", Game.rooms[this.roomId].energyCapacityAvailable);
                    role.spawn(spawns[spawn], this);
                }
            }
        }
    }
}

module.exports = Policy;