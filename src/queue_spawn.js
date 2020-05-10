/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const flag = require("flag");

function SpawnQueue  (roomName) {
    this.home = roomName;
    this.m = flag.getRoomFlag(roomName).memory.spawnQueue;
    //console.log("SpawnQueue constructor room", roomName, "memroy", JSON.stringify(this.m));
    //console.log("data", JSON.stringify(data));
    if (!this.m) {
        flag.getRoomFlag(roomName).memory.spawnQueue = {}
        this.m = flag.getRoomFlag(roomName).memory.spawnQueue;
        this.reset();
    }
    //console.log("SpawnQueue, constructor after", JSON.stringify(this));
}

SpawnQueue.prototype.clear = function () {
    this.m.halted = gc.SPAWN_PRIORITY_NONE;
    this.m.spawns = [];
    for (let i = 0 ; i < gc.SPAWN_PRIORITY_NONE; i++ ) {
        this.m.spawns.push({});
    }
};

SpawnQueue.prototype.reset = function () {
    this.clear();
    this.m.nextOrderId = 0;
    this.m.nextCreepId = 0;
};

SpawnQueue.prototype.spawnNext = function (spawnObj) {
    //console.log("SpawnQueue spawnNext spawnCreep is", JSON.stringify(this))
    for ( let i = gc.SPAWN_PRIORITY_CRITICAL ; i < gc.SPAWN_PRIORITY_NONE ; i++ ) {
        if (i >= this.m.halted) {
            //console.log("halted at", JSON.stringify(i))
            return gc.QUEUE_HALTED;
        }
        for ( let id in this.m.spawns[i]) {
            //console.log("spawnNext id", id, "data", JSON.stringify(this.m.spawns[i][id]))
            const data = this.m.spawns[i][id];
            if  (!data) { // probably should not happen.
                console.log("spawnNext if  (!data) had data", data,"deleting",i,id);
                delete this.m.spawns[i][id];
                continue;
            }
            const name = data.name + "_" + this.m.nextCreepId.toString();
            //console.log("spawnNext dry run spawn",spawnObj.name, "body",JSON.stringify(data.body,),
            //    "name",name, "opts",JSON.stringify(data["opts"]));
            //const result = this.m.spawnDryRun(spawnObj, data.body, name, data.opts );
            const result = spawnObj.spawnCreep(data.body, name, data.opts);
            //console.log("spawnNext spawnCreep result", result);
            if (result === OK) {
                this.m.nextCreepId = this.m.nextCreepId +1;
                //console.log("spawnNext result", result, "OK",OK,"nextCreepId", this.m.nextCreepId)
            }
            //console.log("spawnNext result", result);
            if (result === ERR_BUSY || result === ERR_NOT_ENOUGH_ENERGY) {
                console.log("spawnNext result", result, "Try again later");
                return result;
            }
            //console.log("spawnNext result", result,"OK", OK);
            delete this.m.spawns[i][id];
            if (result === OK) {
                //const realResult = spawnObj.spawnCreep(data.body, name, data.opts);
                //console.log("spawnNext realResult", realResult);
                if (result !== OK) {
                    console.log("body",data.body, "name", name, "opts", optsDryRun);
                    return gf.fatalError("spawn gives different result to dry run", result)
                }
                //console.log("spawnNext spawnCreep returned", result);
                this.m.nextCreepId = this.m.nextCreepId +1;
                //console.log("spawnNext nextCreepId", this.m.nextCreepId)
                //this.m.save();
                return OK;
            }
            if (result === ERR_NOT_OWNER && result !== ERR_NAME_EXISTS) {
                // should not happen
                console.log("body",data.body, "name", name, "opts", optsDryRun);
                return gf.fatalError("spawnCreep failed result");
            }
            // result === ERR_INVALID_ARGS || result === ERR_RCL_NOT_ENOUGH
            //console.log("spawnNext Removed bad spawn order", JSON.stringify(this.m.spawns[i][id], "spawnCrep result ", result))
            //console.log("spawnNext loop", data,"deleting",i,id);
            delete this.m.spawns[i][id];
        }
    }
    //this.m.save();
    //console.log("spawnNext empty queue", JSON.stringify(this));
    return gc.QUEUE_EMPTY;
};

SpawnQueue.prototype.addSpawn = function (data, priority, policyId, startState) {
    //console.log("addSpawn now", JSON.stringify(this));
    //console.log("SpawnQueue addSpawn order data", JSON.stringify(data), "priority", priority, "policyid", policyId, "start state", startState);
    if ( priority<0 || priority >= gc.SPAWN_PRIORITY_COUNT) {
        //console.log("SpawnQueue QUEUE_INSUFFICIENT_PRIORITY", priority );
        return gc.QUEUE_INSUFFICIENT_PRIORITY;
    }
    if (!data || !data.body || !data.name || !policyId || !startState)  {
        //console.log("SpawnQueue QUEUE_INVALID_ARGS", data, "body",data.body,"policyId", policyId, "start state", startState);
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
    //console.log("SpawnQueue addSpawn memory", JSON.stringify(data.opts.memory));
    const id = this.m.nextOrderId;
    this.m.spawns[priority][id] = data;
    this.m.nextOrderId += 1;
    //this.save();
    //console.log("SpawnQueue addSpawn after adding data", JSON.stringify(data));
    //console.log("SpawnQueue addSpawn SpawnQueue is", JSON.stringify(this));
    const q = flag.getRoomFlag(this.home).memory.spawnQueue;
    //console.log("SpawnQueue addSpawn memory after adding spawn", JSON.stringify(q));
    return id;
};

SpawnQueue.prototype.halt = function (priority) {
    //console.log("SpawnQueue halt", priority);
    if (0 < priority || priority >= gc.SPAWN_PRIORITY_NONE) {
        return gc.QUEUE_INVALID_ARGS;
    }
    this.m.halted = priority;
    //console.log("SpawnQueue halted",priority);
    //this.m.save();
    return OK;
};

SpawnQueue.prototype.removeSpawn = function (id) {
    for (let i in this.m.spawns ) {
        if (this.m.spawns[i][id]) {
            //console.log("spawnNext removeSpawn", data,"deleting",i,id);
            delete this.m.spawns[i][id];
            //this.m.save();
            return OK;
        }
    }
    return gc.QUEUE_NOT_FOUND
};

SpawnQueue.prototype.clearMy = function (policyId, priority) {
    let removed =0;
    if (priority) {
        for (let j in this.m.spawns[priority]) {
            if (this.m.spawns[i][j]["opts"]["memory"]["policyId"] === policyId) {
                //console.log("spawnNext clearMy 1", data,"deleting",i,id);
                delete this.m.spawns[i][j];
                removed++;
            }
        }
        //this.m.save();
        return removed;
    }
    for (let i in this.m.spawns) {
        for (let j in this.m.spawns[i]) {
            if (this.m.spawns[i][j]["opts"]["memory"]["policyId"] === policyId) {
                //console.log("spawnNext clearMy 2 deleting",i,j);
                delete this.m.spawns[i][j];
                removed++;
            }
        }
    }
    //this.m.save();
    return removed;
};

//SpawnQueue.prototype.save = function () {
//    const homeFlag = flag.getRoomFlag(this.home);
//    homeFlag.memory.spawnQueue = this.m;
//};

SpawnQueue.prototype.orders = function (policyId, priority) {
    //console.log("SpawnQueue orders policy Id", policyId, "priority", priority);
    //console.log("SpawnQueue orders is", JSON.stringify(this));
    if (!priority) {
        priority = gc.SPAWN_PRIORITY_NONE;
    }
    const orders = [];
    for (let i = 0; i <= priority ; i++) {
        for (let j in this.m.spawns[i]) {
            if (this.m.spawns[i][j]["opts"]["memory"]["policyId"] === policyId) {
                orders.push(this.m.spawns[i][j])
            }
        }
    }
    //console.log("SpawnQueue orders", JSON.stringify(this.m.spawns));
    //console.log("SpawnQueue orders returning orders for", policyId,"priority", priority, JSON.stringify(orders));
    return orders;
};

module.exports = SpawnQueue;