/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const construction = require("construction");

// constructor
function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_BUILD_EXTENSIONS;
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

// runs once every tick
Policy.prototype.enact = function () {
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl];
    const extensions = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    const wantedExtensions = allowedExtensions - extensions.length - beingBuilt.length;
    if (wantedExtensions > 0) {
        buildExtensions(room, wantedExtensions);
    }
    this.m.finished = extensions === wantedExtensions;
};

buildExtensions = function (room, numNeeded) {
    //console.log("buildExtensions room", room.id, "numNeeded", numNeeded)
    const sources = room.find(FIND_SOURCES);
    const spawns  = room.find(FIND_MY_SPAWNS);
    let keyPts = [];
    for (let i in sources) {
        keyPts.push(sources[i].pos)
    }
    let avoid = keyPts;
    for (let i in spawns) {
        keyPts.push(spawns[i].pos)
    }
    let start = construction.centerMass(keyPts);
    const terrain = room.getTerrain();
    start = construction.closestNonWall(start, terrain);

    const structs = room.find(FIND_MY_STRUCTURES);
    for (let i in structs) {
        avoid.push(structs[i].pos)
    }

    const extensionPos = construction.looseSpiral(start, numNeeded, avoid, terrain,1);
    if (extensionPos) {
        for (let i in extensionPos) {
            result = room.createConstructionSite(extensionPos[i].x, extensionPos[i].y, STRUCTURE_EXTENSION);
            if (result !== OK) {
                //console.log("build extension",i,"result",result,"at",JSON.stringify(extensionPos[i]));
                //console.log("buildExtensions build extension failed result", result.toString());
            }
        }
    }
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    return this.finished ? this : false;
};

module.exports = Policy;