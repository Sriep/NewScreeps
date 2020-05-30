/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");

// constructor
function PolicyBuildControllerContainers  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_CONTROLLER_CONTAINERS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.m = data.m;
}

// runs first time policy is created only
PolicyBuildControllerContainers.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    return !!room && !!room.controller && room.controller.my;
};

PolicyBuildControllerContainers.prototype.enact = function () {
   // console.log("POLICY_BUILD_CONTROLLER_CONTAINERS enact");
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    //const room = Game.rooms[this.home];
    //const fRoom = new FlagRoom(this.home);
    //if (fRoom.getControllerPosts()) {
    //     return;
    //}
    this.setContainerSites(room);
};

PolicyBuildControllerContainers.prototype.setContainerSites = function() {
 /*
    const terrain = room.getTerrain();
    let spots = construction.coverArea(room.controller.pos, 3, terrain);
    //console.log("POLICY_BUILD_CONTROLLER_CONTAINERS setContainerSites spots", JSON.stringify(spots));
    if (spots.length === 0) {
        return gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS findMostFreeNeighbours cant get to controller");
    }
    for (let spot of spots) {
        spot.posts = spot.posts.sort( (p1, p2) => {
            return room.controller.pos.getRangeTo(p1.x, p1.y) - room.controller.pos.getRangeTo(p2.x, p2.y)
        });
    }
    Game.flags[room.controller.id].memory.upgraderPosts = spots;
*/
    const fRoom = new FlagRoom(this.home);
    const posts = fRoom.getControllerPosts();
    for (let post of posts) {
        const pos = gf.roomPosFromPos(post);
        const result = pos.createConstructionSite(STRUCTURE_CONTAINER);
        if (result !== OK) {
            gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS controller container construction failed " + result.toString());
        }
    }
};

PolicyBuildControllerContainers.prototype.areControllerContainerFinished = function () {
    const fRoom = new FlagRoom(this.home);
    const posts = fRoom.getControllerPosts();
    if (!posts) {
        return false;
    }
    for (let post of posts) {
        if (!state.findContainerAt(gf.roomPosFromPos(post))) {
            return false;
        }
    }
    return true;
};

PolicyBuildControllerContainers.prototype.draftReplacment = function() {
    const room = Game.rooms[this.home];
    //console.log("POLICY_BUILD_CONTROLLER_CONTAINERS draftReplacment");
    //console.log("areControllerContainerFinished", room.name, areControllerContainerFinished(room));
    return this.areControllerContainerFinished(room) ? false : this;
};

module.exports = PolicyBuildControllerContainers;





































