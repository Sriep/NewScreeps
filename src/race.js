/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");

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
        //console.log("bodyCounts sjon", JSON.stringify(bodyCounts));
        if (!bodyCounts)
            return undefined;
        let body = [];

        for (let i = 0; i < bodyCounts[WORK]; i++) {
            //console.log(i,"pushing work")
            body.push(WORK);
        }
        if (bodyCounts[MOVE] < 1) {
            //console.log("bodyCounts", JSON.stringify(bodyCounts), "race", race,"ec", ec);
            gf.fatalError("creep must have move part")
        }
        for (let i = 0; i < bodyCounts[MOVE]; i++) {
            //console.log(i,"pushing move")
            body.push(MOVE);
        }

        //if (bodyCounts[CARRY] < 1) {
        //    console.log("bodyCounts", JSON.stringify(bodyCounts), "race", race,"ec", ec);
        //    gf.fatalError("creep must have carry part")
        //}
        for (let i = 0; i < bodyCounts[CARRY]; i++) {
            console.log(i,"pushing carry")
            body.push(CARRY);
        }
        //console.log("body", JSON.stringify(body), "race", race, "ec",ec)
        return body;
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
        const body = this.body(race, spawn.room.energyCapacityAvailable);
        if (!body)
            return undefined;
        if (!race)
            return gf.fatalError("trying to spawn creep with no race, spawn", spawn.name, "policy", policyId);
        const memory =  {
            policyId: policyId,
            state: race + "_idle"
        }
        return this.spawn(spawn, body, race, memory);
    },

    spawnWorker: function (spawn, policyId) {
        this.spawnCreep(spawn, policyId, gc.RACE_WORKER, gc.STATE_EMPTY_IDLE)
    },

    spawn: function(spawn, body, race, memory) {
        const name = race + "_" + this.nextCreepId();
        const result = spawn.spawnCreep(body, name, {memory: memory });
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