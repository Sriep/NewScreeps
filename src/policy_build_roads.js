/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const construction = require("construction");

// constructor {"roads" : agendaItem},
function PolicyBuildRoads  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_ROADS;
    this.parentId = data.parentId;
    this.home = data.home;
    this.roads = data.roads;
    this.m = data;
    console.log("POLICY_BUILD_ROADS constuctor this", JSON.stringify(this),
        "data",JSON.stringify(data));
}

// runs first time policy is created only
PolicyBuildRoads.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.planned = false;
    this.home = Memory.policies[this.parentId].roomName;
    console.log("POLICY_BUILD_ROADS initilise this",JSON.stringify(this));
    const room = Game.rooms[this.home];
    console.log("POLICY_BUILD_ROADS initilise room", room.name, room.controller);
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
PolicyBuildRoads.prototype.enact = function () {
    console.log("POLICY_BUILD_ROADS roads",JSON.stringify(this));
    if (this.m.planned || Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    console.log("POLICY_BUILD_ROADS about to plan",this.roads);
    switch (this.roads) {
        case gc.BUILD_ROAD_SOURCE_SPAWN:
            construction.buildRoadSourceSpawn(room);
            break;
        case gc.BUILD_ROAD_SOURCE_CONTROLLER:
            construction.buildRoadSourceController(room);
            break;
        case gc.BUILD_ROAD_SOURCE_EXTENSIONS:
            construction.buildRoadSourceExtensions(room);
            break;
        case gc.BUILD_ROAD_SOURCE_SOURCE:
            construction.buildRoadSources(room);
            break;
        case gc.BUILD_ROAD_SPAWN_CONTROLLER:
            construction.buildRoadSpawnController(room);
            break;
        case gc.BUILD_ROAD_SOURCE_TOWERS:
            construction.buildRoadSourceTowers(room);
            break;
        default:
           gf.fatalError("building unknown road "+ this.roads);
    }
    this.m.planned = true;
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
PolicyBuildRoads.prototype.draftReplacment = function() {
    const room = Game.rooms[this.home];
    console.log("draftReplacment roads built?",construction.roadsBuilt(room)
        , "planned", this.m.planned);
    return construction.roadsBuilt(room) && this.m.planned ? false : this;
};

module.exports = PolicyBuildRoads;



























