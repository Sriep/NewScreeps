/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
const construction = require("construction");

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
    //console.log("POLICY_BUILD_CONTROLLER_CONTAINERS enact");
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const controllerFlag = Game.flags[room.controller.id];
    if (controllerFlag.memory.upgraderPosts) { //undefined
        return;
    }
    setContainerSites(room, controllerFlag);
};

setContainerSites = function(room, cflag) {
    const terrain = room.getTerrain();
    let spots = construction.coverArea(room.controller.pos, 3, terrain);
    //console.log("setContainerSites spots", JSON.stringify(spots));
    if (spots.length === 0) {
        return gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS findMostFreeNeighbours cant get to controller");
    }
    cflag.memory.upgraderPosts = spots;

    for (let spot of spots) {
        //console.log("spot x", spot.x, "spoty", spot.y, "roomname", room.name, JSON.stringify(spot));
        pos = gf.roomPosFromPos(spot, room.name);
        //const pos = new RoomPosition(spot.x, spot.y, room.name);
        const result = pos.createConstructionSite(STRUCTURE_CONTAINER);
        if (result !== OK) {
            gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS controller container construction failed " + result.toString());
        }
    }
};

isControllerContainerFinished = function (room) {
    const flag = Game.flags[room.controller.id];
    const pos = flag.memory.containerPos;
    if (!pos) {
        return false;
    }
    return !!state.findContainerAt(gf.roomPosFromPos(pos, room.name));
};


// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    const room = Game.rooms[this.home];
    //
    //
    // console.log("POLICY_BUILD_CONTROLLER_CONTAINERS draftReplacment isControllerContainerFinished(room)|",isControllerContainerFinished(room))
    return isControllerContainerFinished(room) ? false : this;
};

module.exports = Policy;





































