/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const construction = require("construction");

// constructor
function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_ROADS;
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
    this.m.planned = false;
    const room = Game.rooms[this.m.roomName];
    return !!room && !!room.controller && room.controller.my && this.m.roads;
};

// runs once every tick
Policy.prototype.enact = function () {
    if (this.m.planned || Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.m.roomName];
    switch (this.m.roads) {
        case BUILD_ROAD_SOURCE_SPAWN:
            construction.buildRoadSourceSpawn(room);
            break;
        case BUILD_ROAD_SOURCE_CONTROLLER:
            construction.buildRoadSourceController(room);
            break;
        case BUILD_ROAD_SOURCE_EXTENSIONS:
            construction.buildRoadSourceExtensions(room);
            break;
        case BUILD_ROAD_SOURCE_SOURCE:
            construction.buildRoadSources(room);
            break;
        case BUILD_ROAD_SPAWN_CONTROLLER:
            construction.buildRoadSpawnController(room);
            break;
        case BUILD_ROAD_SOURCE_TOWERS:
            construction.buildRoadSourceTowers(room);
            break;
        default:
           gf.fatalError("building unknonw road "+ this.m.roads);
    }
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    const room = Game.rooms[this.m.roomName];
    return construction.roadsBuilt(room) ? false : this;
};

module.exports = Policy;



























