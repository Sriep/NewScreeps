/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */
const budget = require("budget");
const gf = require("gf");
const race = require("race");
const gc = require("gc");
const flag = require("flag");

function Policy  (data) {
    this.type = gc.POLICY_EXPLORE;
    if (!data) {
        return gf.fatalError("create Policy peace with no data");
    }
    this.id = data.id;
    this.parentId = data.parentId;
    this.home = Memory.policies[this.parentId].roomId;
}

Policy.prototype.initilise = function () {
    console.log("initilise explore policy");

    const data = {
        body:   race.body(gc.RACE_SCOUT, 50),
        memory: {home : this.roomName},
        name: gc.RACE_SCOUT,
    };
    const queue = flag.getSpawnQueue(this.roomName);
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
    console.log("enact explore policy");
    const policyId = this.id;
    let creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
    });
    for (let i in creeps) {
        const flag = Game.flags[creeps[i].room.name];
        if (fag.explored) {
            continue
        }
        flag.value = budget.valueNeutralRoom(
            creeps[i].room.name,
            Game.rooms[this.roomName],
            false,
        );
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;





































