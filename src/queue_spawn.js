/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const flag = require("flag");

function SpawnQueue  (roomName) {
    this.home = roomName;
    const flagHome = flag.getRoomFlag(roomName);
    this.queue = flagHome.memory.spawnQueue;
    if (!this.queue) {
        this.clear();
    }
}

SpawnQueue.prototype.spawnNext = function (spawn) {
    for (let i of this.queue.spawns ) {
        if (i <= this.queue.halted) {
            return gc.QUEUE_HALTED;
        }
        while (this.queue.spawns[i].length > 0) {
            const data = this.queue.spawns[i][0].data;
            const name = data.name + "_" + this.nextCreepId();
            switch (this.spawnDryRun(spawn, data.body, name, data.opts)) {
                case OK: {
                    result = spawn.spawnCreep(data.body, name, data.opts);
                    if (result !== OK) {
                        console.log("body",data.body, "name", name, "opts", optsDryRun);
                        return gf.fatalError("spawn gives different result to dry run", result)
                    }
                    Memory.nextCreepId = Memory.nextCreepId +1;
                    this.queue.spawns[i].splice();
                    this.save();
                    return OK;
                } // The operation has been scheduled successfully.
                case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
                    console.log("body",data.body, "name", name, "opts", optsDryRun);
                    return gf.fatalError("ERR_NOT_OWNER");
                case ERR_NAME_EXISTS:           // There is a creep with the same name already.
                    console.log("body",data.body, "name", name, "opts", optsDryRun);
                    return gf.fatalError("ERR_NAME_EXISTS");
                case ERR_BUSY:                  // The spawn is already in process of spawning another creep.
                    return ERR_BUSY;
                case ERR_NOT_ENOUGH_ENERGY:     // The spawn and its extensions contain not enough energy to create a creep with the given body.
                    return ERR_NOT_ENOUGH_ENERGY;
                case ERR_INVALID_ARGS:          // Body is not properly described or name was not provided.
                    console.log("build returned error ERR_INVALID_ARGS deleting", result, "data", JSON.stringify(data));
                    break;
                case ERR_RCL_NOT_ENOUGH:        // Your Room Controller level is insufficient to use this spawn.
                    console.log("build returned error ERR_RCL_NOT_ENOUGH deleting", result, "data", JSON.stringify(data));
                    break;
                default:
                    console.log("body",data.body, "name", name, "opts", optsDryRun)
                    return gf.fatalError("spawnCreep unrecognised return value", result);
            }
            this.queue.spawns[i].splice();
            this.save();
        }
    }
    return gc.QUEUE_EMPTY;
};

SpawnQueue.prototype.addSpawn = function (data, priority, policyId, startState) {
    if (0 < priority || priority >= gc.SPAWN_PRIORITY_COUNT) {
        return gc.QUEUE_INVALID_ARGS;
    }
    if (!data || !data.body || data.name === undefied || !policyId || !startState)  {
        return gc.QUEUE_INVALID_ARGS;
    }
    if (!data.opts) {
        data.opts = {};
    }
    if (!data.opts.memory) {
        data.opts.memory = {};
    }
    data[opts][memory][policyId] = policyId;
    data[opts][memory][state] = startState;
    const id = this.queue.NextId;
    this.queue.spawns[priority].push({data: data, id: id});
    this.queue.NextId += 1;
    this.save();
    return id;
};

SpawnQueue.prototype.halt = function (priority) {
    if (0 < priority || priority >= gc.SPAWN_PRIORITY_COUNT) {
        return gc.QUEUE_INVALID_ARGS;
    }
    this.queue.halted = priority;
    this.save();
    return OK;
};
SpawnQueue.prototype.clear = function () {
    this.queue = {
        halted: gc.SPAWN_PRIORITY_NONE,
        nextId: 0,
        spawns: [],
    };
    for (let i = 0 ; i<gc.SPAWN_PRIORITY_NONE; i++ ) {
        this.queue.spawns.push([]);
    }
    this.save;
};

SpawnQueue.prototype.removeSpawn = function (id) {
    for (let i of this.queue.spawns ) {
        for (let j of this.queue.spawns[i]) {
            if (this.queue.spawns[i][j][id] === id) {
                this.queue.spawns[i].splice(j, 1);
                this.save()
                return OK;
            }
        }
    }
    this.save();
    return gc.QUEUE_NOT_FOUND
};

SpawnQueue.prototype.clearMy = function (policyId, priority) {
    let removed =0;
    if (priority) {
        for (let j of this.queue.spawns[priority]) {
            if (this.queue.spawns[i][j][data][opts][memory][policyId] === policyId) {
                this.queue.spawns[i].splice(j, 1);
                removed++;
            }
        }
        this.save();
        return removed;
    }
    for (let i of this.queue.spawns) {
        for (let j of this.queue.spawns[i]) {
            if (this.queue.spawns[i][j][data][opts][memory][policyId] === policyId) {
                this.queue.spawns[i].splice(j, 1);
                removed++;
            }
        }
    }
    this.save();
    return removed;
};

SpawnQueue.prototype.spawnDryRun = function (spawn, data, name, opts) {
    let optsDryRun = opts;
    optsDryRun.dryRun = true;
    return spawn.spawnCreep(data.body, name, optsDryRun);
};

SpawnQueue.prototype.save = function () {
    const flag = flag.getRoomFlag(this.home);
    flag.memory.spawnQueue = this.queue;
};

SpawnQueue.prototype.orders = function (policyId, priority) {
    if (!priority) {
        priority = gc.SPAWN_PRIORITY_NONE;
    }
    const orders = [];
    for (let i = 0; i < priority ; i++) {
        for (let j of this.queue.spawns[i]) {
            if (this.queue.spawns[i][j][id] === policyId) {
                orders.push(this.queue.spawns[i][j])
            }
        }
    }
    return orders;
};

module.exports = SpawnQueue;