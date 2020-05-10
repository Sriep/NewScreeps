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

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_EXPLORE;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    this.m.direction = TOP;

    return true;
};

Policy.prototype.enact = function (shortfall) {
    const policyId = this.id;
    const creeps = policy.getCreeps(policyId, gc.RACE_SCOUT);
    if (creeps.length < gc.EXPLORE_CREEPS) {
        const orders = flag.getSpawnQueue(this.home).orders(this.id);
        if (creeps.length +  orders.length < gc.EXPLORE_CREEPS) {
            this.sendExplorers(gc.EXPLORE_CREEPS - creeps.length -  orders.length)
        }
    }
    //console.log("enact explore policy", creeps.length, "creeps exploring this", JSON.stringify(this));
    for (let i in creeps) {
        let flagRoom = Game.flags[creeps[i].room.name];
        if (flagRoom && flagRoom.memory.explored) {
            continue;
        }
        if (!flagRoom) {
            const center = new RoomPosition(25, 25, creeps[i].room.name);
            center.createFlag(creeps[i].room.name);
            flagRoom = Game.flags[creeps[i].room.name];
        }
        flag.flagRoom(creeps[i].room.name);
        //console.log("creep", creeps[i].name, "in unexplored room", creeps[i].room.name);
        flagRoom.memory.value = budget.valueNeutralRoom(
            creeps[i].room.name,
            Game.rooms[this.home],
            false,
        );
        flagRoom.memory.explored = true;
    }
};

Policy.prototype.sendExplorers = function(shortfall) {
    //console.log("POLICY_EXPLORE", shortfall);
    for (let i = 0; i < shortfall; i++) {
        const data = {
            "body": race.body(gc.RACE_SCOUT, BODYPART_COST[MOVE]),
            "opts": {"memory": {
                "home" : this.roomName,
                "direction" : this.m.direction,
            }},
            "name": gc.RACE_SCOUT + "_50",
        };
        flag.getSpawnQueue(this.home).addSpawn(
            data,
            gc.SPAWN_PRIORITY_MISC,
            this.id,
            gc.STATE_SCOUT_IDLE,
        );
        this.m.direction = (this.m.direction+2) % 8;
    }
};


Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;





































