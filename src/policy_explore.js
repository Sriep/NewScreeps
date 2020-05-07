/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */
const budget = require("budget");
const race = require("race");
const gc = require("gc");
const flag = require("flag");
const policy = require("policy");

function Policy  (data) {
    this.type = gc.POLICY_EXPLORE;
    this.id = data.id;
    this.parentId = data.parentId;
    this.home = Memory.policies[this.parentId].roomId;
    this.direction = data.direction;
}

Policy.prototype.initilise = function () {
    const data = {
        body:   race.body(gc.RACE_SCOUT, BODYPART_COST[MOVE]),
        memory: {home : this.roomName},
        name: gc.RACE_SCOUT,
    };
    const queue = flag.getSpawnQueue(this.home);
    data.memory.direction = TOP;
    queue.addSpawn(data, gc.SPAWN_PRIORITY_MISC, this.id);
    data.memory.direction = RIGHT;
    queue.addSpawn(data, gc.SPAWN_PRIORITY_MISC, this.id);
    data.memory.direction = BOTTOM;
    queue.addSpawn(data, gc.SPAWN_PRIORITY_MISC, this.id);
    data.memory.direction = LEFT;
    queue.addSpawn(data, gc.SPAWN_PRIORITY_MISC, this.id);
    return true;
};

Policy.prototype.enact = function () {
    const policyId = this.id;
    const creeps = policy.getCreeps(policyId, gc.RACE_SCOUT);
    if (creeps.length < gc.EXPLORE_CREEPS) {

    }
    console.log("enact explore policy", creeps.length, "creeps exploring this", JSON.stringify(this));
    for (let i in creeps) {
        const flag = Game.flags[creeps[i].room.name];
        if (fag.explored) {
            continue
        }
        console.log("creep", creep[i].name, "in unexplored room", creeps[i].room.name);
        flag.value = budget.valueNeutralRoom(
            creeps[i].room.name,
            Game.rooms[this.roomName],
            false,
        );
    }
};

Policy.prototype.sendExplorer = function() {
    queue = flag.getSpawnQueue(this.home);
    const orders = queue.orders(this.id);
    if (creeps.length + orders.length < gc.EXPLORE_CREEPS) {
        const data = {
            "body": race.body(gc.RACE_SCOUT, BODYPART_COST[MOVE]),
            "opts": {"memory": {"home" : this.roomName}},
            "name": gc.RACE_SCOUT + "_50",
        };
        data.opts.memory.direction = LEFT;
        queue.addSpawn(
            data,
            gc.SPAWN_PRIORITY_MISC,
            this.id
        )
    }
};


Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;





































