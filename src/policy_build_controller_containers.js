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
    if (state.getControllerPosts(room.controller.id)) {
        return;
    }
    setContainerSites(room);
};

setContainerSites = function(room) {
    const terrain = room.getTerrain();
    let spots = construction.coverArea(room.controller.pos, 3, terrain);
    //console.log("setContainerSites spots", JSON.stringify(spots));
    if (spots.length === 0) {
        return gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS findMostFreeNeighbours cant get to controller");
    }
    for (let spot of spots) {
        //console.log("setContainerSites", JSON.stringify(spot));
        spot.posts = spot.posts.sort( (p1, p2) => {
            return room.controller.pos.getRangeTo(p1.x, p1.y) - room.controller.pos.getRangeTo(p2.x, p2.y)
        });
    }
    Game.flags[room.controller.id].memory.upgraderPosts = spots;

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

areControllerContainerFinished = function (room) {
    const posts = state.getControllerPosts(room.controller.id);
    if (!posts) {
        return false;
    }
    for (let post of posts) {
        if (!state.findContainerAt(gf.roomPosFromPos({x:post.x, y:post.y}, room.name))) {
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
    //console.log("POLICY_BUILD_CONTROLLER_CONTAINERS draftReplacment");
    //console.log("areControllerContainerFinished", room.name, areControllerContainerFinished(room));
    return areControllerContainerFinished(room) ? false : this;
};

module.exports = Policy;





































