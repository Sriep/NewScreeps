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
    this.type = gc.POLICY_BUILD_CONTROLLER_CONTAINERS;
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
    return !!room && !!room.controller && room.controller.my;
};

Policy.prototype.enact = function () {
    console.log("POLICY_BUILD_CONTROLLER_CONTAINERS enact");
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const controllerFlag = Game.flags[room.controller.id];
    if (!controllerFlag.memory.containerPos) {
        //console.log("POLICY_BUILD_CONTROLLER_CONTAINERS controllerFlag.memory.containerPos", JSON.stringify(controllerFlag.memory.containerPos));
        return;
    }
    let spots = economy.findMostFreeNeighbours(
        room, room.controller.pos, 2
    );
    if (spots.length === 0) {
        return gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS findMostFreeNeighbours cant get to controller");
    }

    controllerFlag.memory.upgraderPosts = spots[0].neighbours;
    spots[0].pos.roomName = room.name;
    controllerFlag.memory.containerPos = spots[0].pos;
    if (state.findContainerOrConstructionAt(gf.roomPosFromPos(spots[0].pos))) {
        //console.log("POLICY_BUILD_CONTROLLER_CONTAINERS findContainerOrConstructionAt");
        return;
    }
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        //console.log("spot", JSON.stringify(spots[0]));
        gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS controller container construction failed " + result.toString());
    }
};

isControllerContainerFinished = function (room) {
    const flag = Game.flags[room.controller.id];
    const pos = flag.memory.containerPos;
    if (!pos) {
        return false;
    }
    return undefined !== state.findContainerAt(gf.roomPosFromPos(pos, room.name));
};


// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    const room = Game.rooms[this.home];
    return isControllerContainerFinished(room) ? false : this;
};

module.exports = Policy;





































