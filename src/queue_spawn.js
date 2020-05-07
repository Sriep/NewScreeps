/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const flag = require("flag");

function SpawnQueue  (roomName) {
    this.home = roomName;
    const data = flag.getRoomFlag(roomName).memory.spawnQueue;
    //console.log("data", JSON.stringify(data));
    if (data) {
        this.halted = data.halted ? data.halted : gc.SPAWN_PRIORITY_NONE;
        this.spawns = data.spawns;
        this.nextOrderId = data.nextOrderId ? data.nextOrderId : 0;
        this.nextCreepId = data.nextCreepId ? data.nextCreepId : 0;
    } else {
        this.clear();
        this.nextOrderId = 0;
        this.nextCreepId = 0;
    }
    //console.log("SpawnQueue, constructor after", JSON.stringify(this));
}

SpawnQueue.prototype.clear = function () {
    this.halted = gc.SPAWN_PRIORITY_NONE;
    this.spawns = [];
    for (let i = 0 ; i < gc.SPAWN_PRIORITY_NONE; i++ ) {
        this.spawns.push({});
    }
    this.save();
};

SpawnQueue.prototype.spawnNext = function (spawnObj) {
    for ( let i = gc.SPAWN_PRIORITY_CRITICAL ; i < gc.SPAWN_PRIORITY_NONE ; i++ ) {
        if (i >= this.halted) {
            //console.log("halted at", JSON.stringify(i))
            return gc.QUEUE_HALTED;
        }
        for ( let id in this.spawns[i]) {
            //console.log("spawnNext id", id, "data", JSON.stringify(this.spawns[i][id]))
            const data = this.spawns[i][id];
            if  (!data) { // probably should not happen.
                console.log("spawnNext if  (!data) had data", data,"deleting",i,id);
                delete this.spawns[i][id];
                continue;
            }
            const name = data.name + "_" + this.nextCreepId.toString();
            //console.log("spawnNext dry run spawn",spawnObj.name, "body",JSON.stringify(data.body,),
            //    "name",name, "opts",JSON.stringify(data["opts"]));
            //const result = this.spawnDryRun(spawnObj, data.body, name, data.opts );
            const result = spawnObj.spawnCreep(data.body, name, data.opts);
            //result = this.spawnDryRun(spawnObj, data.body, name, {memory: data.opts.memory} );
            //result = this.spawnDryRun(spawnObj, data.body, "my_test-name", {memory: {"policyId":1, "state":"worker_idle"} });
            //result = this.spawnDryRun(spawnObj, data.body, "my_test-name2");
            if (result === OK) {
                this.nextCreepId = this.nextCreepId +1;
                //console.log("spawnNext result", result, "OK",OK,"nextCreepId", this.nextCreepId)
            }
            //console.log("spawnNext result", result);
            if (result === ERR_BUSY || result === ERR_NOT_ENOUGH_ENERGY) {
                console.log("spawnNext result", result, "Try again later");
                return result;
            }
            //console.log("spawnNext result", result,"OK", OK);
            delete this.spawns[i][id];
            if (result === OK) {
                //const realResult = spawnObj.spawnCreep(data.body, name, data.opts);
                //console.log("spawnNext realResult", realResult);
                if (result !== OK) {
                    console.log("body",data.body, "name", name, "opts", optsDryRun);
                    return gf.fatalError("spawn gives different result to dry run", result)
                }
                //console.log("spawnNext spawnCreep returned", result);
                this.nextCreepId = this.nextCreepId +1;
                //console.log("spawnNext nextCreepId", this.nextCreepId)
                this.save();
                return OK;
            }
            if (result === ERR_NOT_OWNER && result !== ERR_NAME_EXISTS) {
                // should not happen
                console.log("body",data.body, "name", name, "opts", optsDryRun);
                return gf.fatalError("spawnCreep failed result");
            }
            // result === ERR_INVALID_ARGS || result === ERR_RCL_NOT_ENOUGH
            console.log("spawnNext Removed bad spawn order", JSON.stringify(this.spawns[i][id], "spawnCrep result ", result))
            //console.log("spawnNext loop", data,"deleting",i,id);
            delete this.spawns[i][id];
        }
    }
    this.save();
    console.log("spawnNext empty queue", JSON.stringify(this));
    return gc.QUEUE_EMPTY;
};

SpawnQueue.prototype.addSpawn = function (data, priority, policyId, startState) {
    //console.log("addSpawn now", JSON.stringify(this))
    //console.log("order data", JSON.stringify(data), "priority", priority, "policyid", policyId, "startstate", startState);
    if (0 < priority || priority >= gc.SPAWN_PRIORITY_COUNT) {
        return gc.QUEUE_INVALID_ARGS;
    }
    if (!data || !data.body || !data.name || !policyId || !startState)  {
        return gc.QUEUE_INVALID_ARGS;
    }
    if (!data.opts) {
        data.opts = {};
        data.opts["memory"] = {}
    }
    if (!data.opts["memory"]) {
        data.opts["memory"] = {};
    }
    data.opts.memory["policyId"] =  policyId;
    data.opts.memory["state"] = startState;
    //console.log("addSpawn memory", JSON.stringify(data.opts.memory));
    const id = this.nextOrderId;
    this.spawns[priority][id] = data;
    this.nextOrderId += 1;
    this.save();
    //console.log("addSpawn after adding data", JSON.stringify(data));
    //console.log("addSpawn now queue is", JSON.stringify(this));
    return id;
};

SpawnQueue.prototype.halt = function (priority) {
    //console.log("SpawnQueue halt", priority);
    if (0 < priority || priority >= gc.SPAWN_PRIORITY_NONE) {
        return gc.QUEUE_INVALID_ARGS;
    }
    this.halted = priority;
    console.log("SpawnQueue halted",priority);
    this.save();
    return OK;
};

SpawnQueue.prototype.removeSpawn = function (id) {
    for (let i in this.spawns ) {
        if (this.spawns[i][id]) {
            console.log("spawnNext removeSpawn", data,"deleting",i,id);
            delete this.spawns[i][id];
            this.save();
            return OK;
        }
    }
    return gc.QUEUE_NOT_FOUND
};

SpawnQueue.prototype.clearMy = function (policyId, priority) {
    let removed =0;
    if (priority) {
        for (let j in this.spawns[priority]) {
            if (this.spawns[i][j]["opts"]["memory"]["policyId"] === policyId) {
                //console.log("spawnNext clearMy 1", data,"deleting",i,id);
                delete this.spawns[i][j];
                removed++;
            }
        }
        this.save();
        return removed;
    }
    for (let i in this.spawns) {
        for (let j in this.spawns[i]) {
            if (this.spawns[i][j]["opts"]["memory"]["policyId"] === policyId) {
                console.log("spawnNext clearMy 2 deleting",i,j);
                delete this.spawns[i][j];
                removed++;
            }
        }
    }
    this.save();
    return removed;
};

SpawnQueue.prototype.save = function () {
    const homeFlag = flag.getRoomFlag(this.home);
    homeFlag.memory.spawnQueue = this;
};

SpawnQueue.prototype.orders = function (policyId, priority) {
    if (!priority) {
        priority = gc.SPAWN_PRIORITY_NONE;
    }
    const orders = [];
    for (let i = 0; i < priority ; i++) {
        for (let j in this.spawns[i]) {
            if (this.spawns[i][j]["opts"]["memory"]["policyId"] === policyId) {
                orders.push(this.spawns[i][j])
            }
        }
    }
    console.log("all orders", JSON.stringify(this.spawns));
    console.log("returning orders for", policyId,"priority", priority, JSON.stringify(orders));
    return orders;
};

module.exports = SpawnQueue;