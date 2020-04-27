/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const race_worker = require("race_worker");

const role = {

    spawnWorker: function (spawn, policy) {
        //console.log("maxSizeRoom", race_worker.maxSizeRoom(spawn.room));
        const body = race_worker.body(race_worker.maxSizeRoom(spawn.room));
        //console.log("spawn creep", JSON.stringify(body));
        const memory =  {
            policyId: policy.id,
            state: gc.STATE_EMPTY_IDLE
        }
        return this.spawn(spawn, body, gc.RACE_WORKER, memory);
    },

    spawn: function(spawn, body, race, memory) {
        console.log("spawn creep| ", JSON.stringify(body), " |race| ", race, " |memory| ", JSON.stringify(memory));
        const name = race + "_" + role.nextCreepId();
        const result = spawn.spawnCreep(body, name, {memory: memory });
        //console.log("spawnCreep result", result);
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

module.exports = role;