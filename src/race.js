/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const flag = require("flag");

const race = {
    NUMBER_ROLE_TYPES: 6,
    LoadTime: {"harvester": 25, "upgrader": 25, "builder":25, "repairer": 25
        , "energy.porter" : 0, "flexi.storage.porter" : 0},

    OffloadTime: {"harvester": 1, "upgrader": 50, "builder":5, "repairer": 50
        , "energy.porter" : 40 , "flexi.storage.porter" : 40},

    getRace: function (creep) {
        return creep.name.split("_")[0];
    },

    body: function (race, ec) {
        const raceModule = require("race_" + race);
        const bodyCounts = raceModule.bodyCounts(ec)
        if (!bodyCounts){
            return undefined;
        }
        let body = [];

        for (let i = 0; i < bodyCounts[WORK]; i++) {
            body.push(WORK);
        }
        if (bodyCounts[MOVE] < 1) {
            console.log("body race", race, "ec",ec)
            return undefined;
        }
        for (let i = 0; i < bodyCounts[MOVE]; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < bodyCounts[CARRY]; i++) {
            body.push(CARRY);
        }
        return body;
    },

    partsFromBody: function(body, part) {
        let count=0;
        for (let i in body) {
            if (body[i] === part) {
                count++
            }
        }
        return count;
    },

    partsFromBody2: function(body, part) {
        let count=0;
        for (let i in body) {
            if (body[i].type === part) {
                count++
            }
        }
        return count;
    },

    ticksLeftByPart(policyId, race, part) {
        console.log("ticksLeftByPart policyId", policyId, "race", race, "part", part);

        const creeps = _.filter(Game.creeps, function (c) {
            return c.memory.policyId === policyId
                && race === c.name.split("_")[0]
        });
        //console.log("ticksLeftByPart creeps lenght", creeps.length);
        let lifeLeft = 0;
        for (let creep of creeps) {
            const parts = this.partsFromBody2(creep.body, part);
            //console.log("1parts", creep, parts,creep.ticksToLive, JSON.stringify(creep.body),"part",part)
            lifeLeft += creep.ticksToLive * parts;
        }
        //console.log("ticksLeftByPart lifeLeft", lifeLeft);

        //let lifeLeft2 = 0;
        //for (let creep in creeps) {
        //    const parts = this.partsFromBody2(creeps[creep].body, part);
        //    console.log("2parts", creep, parts,creeps[creep].ticksToLive,"body",
        //        JSON.stringify(creeps[creep].body),"part",part );
        //    lifeLeft2 += creeps[creep].ticksToLive * parts;
        //}
        //console.log("ticksLeftByPart lifeLeft2", lifeLeft2);

        return lifeLeft;
    },

    workParts: function(creep) {
        const body = creep.body;
        let Ws = 0;
        for (let i in body) {
            if (body[i] === WORK) {
                Ws++;
            }
        }
        return Ws;
    },

    repairPower: function(creep) {
        return workParts(creep) * REPAIR_POWER;
    },

    spawnCreep: function (spawn, policyId, race) {
        //console.log("spawnCreep race",race, "ec", spawn.room.energyCapacityAvailable)
        //console.log("spawnCreep race",race, "ec energyAvailablenumber", spawn.room.energyAvailable)
        const body = this.body(race, spawn.room.energyAvailable);
        if (!body) {
            return undefined;
        }
        if (!race) {
            return gf.fatalError("trying to spawn creep with no race, spawn", spawn.name, "policy", policyId);
        }
        const memory =  {
            policyId: policyId,
            state: race + "_idle"
        };
        return this.spawn(spawn, body, race, memory);
    },

    sendOrderToQueue : function(room, cRace, energy, policyId, priority) {
        const data = {
            body: this.body(cRace, energy),
            name: cRace,// + "_" + energy.toString(),
        };
        const queue = flag.getSpawnQueue(room.name);
        return queue.addSpawn(data, priority, policyId,  cRace + "_idle");
    },

    spawnWorker: function (spawn, policyId) {
        this.spawnCreep(spawn, policyId, gc.RACE_WORKER, gc.STATE_EMPTY_IDLE)
    },

    spawn: function(spawn, body, race, memory) {
        const name = race + "_" + this.nextCreepId();
        console.log("race spawn body|", JSON.stringify(body), "|name|",name, "|opts|", JSON.stringify({memory: memory }));
        const result = spawn.spawnCreep(body, name, {memory: memory });
        //console.log("spawn creep result", result, "body", JSON.stringify(body));
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                Memory.nextCreepId = Memory.nextCreepId +1;
                return OK;
            case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
                return gf.fatalError("ERR_NOT_OWNER");
            case ERR_NAME_EXISTS:           // There is a creep with the same name already.
                return gf.fatalError("ERR_NAME_EXISTS");
            case ERR_BUSY:                  // The spawn is already in process of spawning another creep.
                return gf.fatalError("ERR_BUSY");
            case ERR_NOT_ENOUGH_ENERGY:     // The spawn and its extensions contain not enough energy to create a creep with the given body.
                return ERR_NOT_ENOUGH_ENERGY
            case ERR_INVALID_ARGS:          // Body is not properly described or name was not provided.
                return gf.fatalError("ERR_INVALID_ARGS");
            case ERR_RCL_NOT_ENOUGH:        // Your Room Controller level is insufficient to use this spawn.
                return ERR_RCL_NOT_ENOUGH;
            default:
                throw("spawnCreep unrecognised return value");
        }
    },

    nextCreepId: function() {
        if (!Memory.nextCreepId) {
            Memory.nextCreepId = 1;
        }
        return Memory.nextCreepId.toString();
    },

}

module.exports = race;