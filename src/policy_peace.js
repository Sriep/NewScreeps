/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const economy = require("economy");
const role = require("role");

function Policy  (data) {
    //console.log("new policy peace", JSON.stringify(data))
    this.type = gc.POLICY_PEACE;
    if (data) {
        this.id = data.id;
        this.roomId = data.roomId;
    }
}

Policy.prototype.enact = function () {
    //console.log("enacting policy peace this", JSON.stringify(this));
    const room = Game.rooms[this.roomId]
    //console.log("roomid", this.roomId, "room object", Game.rooms[this.roomId]);

    const spawns = Game.rooms[this.roomId].find(FIND_MY_SPAWNS);
    for (let spawn in spawns) {
         if (spawns[spawn].spawning === null) {
            //console.log("run economyPeace nextSpawn", this.roomId, spawn, "porterShortfall", economy.porterShortfall(this));
            if (0 < economy.porterShortfall(this)) {
                let creepCount = 0;
                for (let creep in Game.creeps) {
                    if (Game.creeps[creep].memory.policyId === this.id)
                        creepCount++;
                }
                //console.log("policy peace id", this.id, "cc", creepCount);

                //const creeps = _.filter(Game.creeps, function (creep) {
                //    console.log("in filter creeps", creep,"the creep", Game.creeps[creep], "duh", creep[0])
                //    return Game.creeps[creep].memory.policyId === this.id});

                console.log("maxCreepsCanFitRoundSources", economy.sourceAccessPointsRoom(room), "num creeps", creepCount);
                if (creepCount < economy.sourceAccessPointsRoom(room)) {
                    //console.log("spawn creep energy capacity", Game.rooms[this.roomId].energyCapacityAvailable);
                    role.spawnWorker(spawns[spawn], this);
                }
            }
        }
    }
}

module.exports = Policy;