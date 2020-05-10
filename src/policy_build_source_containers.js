/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const economy = require("economy");
const state = require("state");

// constructor
function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_SOURCE_CONTAINERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    //console.log("POLICY_BUILD_SOURCE_CONTAINERS initilise", JSON.stringify(this));
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
Policy.prototype.enact = function () {
    //console.log("POLICY_BUILD_SOURCE_CONTAINERS enact");
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        //return;
    }
    const room = Game.rooms[this.home];
    const sources = room.find(FIND_SOURCES);
    for (let source of sources) {
        const flag = Game.flags[source.id];
        //console.log("POLICY_BUILD_SOURCE_CONTAINERS source id", source.id, "flag", flag);
        if (!flag.memory.containerPos) {
            buildSourceContainer(source, flag);
        }
    }
};

buildSourceContainer = function (source, flag) {
    //console.log("POLICY_BUILD_SOURCE_CONTAINERS buildSourceContainer");
    let spots = economy.findMostFreeNeighbours(
        source.room, source.pos, 1
    );
    if (spots.length === 0) {
        return gf.fatalError("findMostFreeNeighbours cant get to source");
    }
    flag.memory.harvesterPosts = spots[0].neighbours;
    spots[0].pos.roomName = source.room.name;
    flag.memory.containerPos = spots[0].pos;
    if (state.findContainerOrConstructionAt(gf.roomPosFromPos(spots[0].pos))) {
        return;
    }
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        //console.log("spot", JSON.stringify(spots[0]));
        gf.fatalError("construction failed " + result.toString(),"pos", JSON.stringify(spots[0].pos));
    }
};

areSourceContainersFinished = function (room) {
    const sources = room.find(FIND_SOURCES);
    for (let i in sources) {
        const flag = Game.flags[sources[i].id];
        if (!flag.memory.containerPos) {
            return false
        }
        const container = state.findContainerAt(gf.roomPosFromPos(flag.memory.containerPos));
        if (!container) {
            return false;
        }
    }
    return true;
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    const room = Game.rooms[this.home];
    //console.log("draftReplacment buld source containers ascf",
    //    areSourceContainersFinished(room));
    return areSourceContainersFinished(room) ? false : this;
};

module.exports = Policy;





































