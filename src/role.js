/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const role = {
    enact : function(creep) {
        console.log("role enact creep", creep);
        data = creep.name.split("_")
        console.log("split name", JSON.stringify(data));


    },

    getNextCreepId: function() {
        if (Memory.nextCreepId === undefined) {
            Memory.nextCreepId = 1;
        }
        let latestId = Memory.nextCreepId;
        Memory.nextCreepId = Memory.nextCreepId +1;
        return latestId.toString();
    },

    spawn: function (spawn, policy) {
        //console.log("maxSizeRoom", race_worker.maxSizeRoom(spawn.room));
        const body = race_worker.body(race_worker.maxSizeRoom(spawn.room));
        //console.log("spawn creep", JSON.stringify(body));
        const name = gc.ROLE_WORKER + "_" + policy.id.toString() + "_" + role.getNextCreepId();
        //console.log("spawn creep name", name);
        const result = spawn.spawnCreep(body, name);
        //console.log("spawnCreep result", result);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                return OK;
            case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
                throw("ERR_NOT_OWNER");
            case ERR_NAME_EXISTS:           // There is a creep with the same name already.
                throw("ERR_NAME_EXISTS");
            case ERR_BUSY:                  // The spawn is already in process of spawning another creep.
                throw("ERR_BUSY");
            case ERR_NOT_ENOUGH_ENERGY:     // The spawn and its extensions contain not enough energy to create a creep with the given body.
                return ERR_NOT_ENOUGH_ENERGY
            case ERR_INVALID_ARGS:          // Body is not properly described or name was not provided.
                throw("ERR_INVALID_ARGS");
            case ERR_RCL_NOT_ENOUGH:        // Your Room Controller level is insufficient to use this spawn.
                return ERR_RCL_NOT_ENOUGH;
            default:
                throw("spawnCreep unrecognised return value");
        }
    }
}

module.exports = role;