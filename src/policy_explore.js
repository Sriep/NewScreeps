/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */
const budget = require("budget");
const gf = require("gf");
const state = require("state");
const gc = require("gc");

function Policy  (data) {
    this.type = gc.POLICY_PEACE;
    if (!data) {
        return gf.fatalError("create Policy peace with no data");
    }
    this.id = data.id;
    this.parentId = data.parentId;
    this.roomName = Memory.policies[this.parentId].roomId;
}

Policy.prototype.initilise = function () {
    console.log("initilise explore policy");

    const body = state.body(gc.RACE_SCOUT, 50);
    const memory = {
        policyId : this.id,
        home : this.roomName
    };
    const buildList = Memory.policies[this.parentId].builds;
    memory.direction = TOP;
    buildList.push({ body: body, race: gc.RACE_SCOUT, memory: memory});
    memory.direction = RIGHT;
    buildList.push({ body: body, race: gc.RACE_SCOUT, memory: memory});
    memory.direction = BOTTOM;
    buildList.push({ body: body, race: gc.RACE_SCOUT, memory: memory});
    memory.direction = LEFT;
    buildList.push({ body: body, race: gc.RACE_SCOUT, memory: memory});

    flag = Game.rooms[this.roomName].contorller.pos.createFlag(this.roomName);
    flag.memory.explored = true;
}

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
}

module.exports = Policy;





































