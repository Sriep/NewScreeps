/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const construction = require("construction");
const policy = require("policy");

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
    this.m.finished = false;
    this.home = Memory.policies[this.parentId].roomName;
    const room = Game.rooms[this.home];
    console.log("POLICY_BUILD_EXTENSIONS initilise", JSON.stringify(this));
    return !!room && !!room.controller && room.controller.my;
};

// runs once every tick
Policy.prototype.enact = function () {
    //console.log("POLICY_BUILD_EXTENSIONS enact");
    if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
        return;
    }
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl];
    const extensions = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    if (extensions.length >= allowedExtensions) {
        this.m.finished = true;
        //console.log("POLICY_BUILD_EXTENSIONS finished extensions.length",
        //    extensions.length, "allowedExtensions",allowedExtensions);
        return;
    }
    const beingBuilt  = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    if (extensions.length + beingBuilt.length >= allowedExtensions) {
        //console.log("POLICY_BUILD_EXTENSIONS all sites done extensions.length",
        //    extensions.length, "csites", beingBuilt.length ,"allowedExtensions",allowedExtensions);
        return;
    }
    const wantedExtensions = allowedExtensions - extensions.length - beingBuilt.length;
    console.log("POLICY_BUILD_EXTENSIONS still need to set up",wantedExtensions ,"construction sites");
    policy.buildStructuresLooseSpiral(room, STRUCTURE_EXTENSION, wantedExtensions, 3);
    //buildExtensions(room, wantedExtensions)
};

buildExtensions = function (room, numNeeded) {
    //console.log("buildExtensions room", room.name, "numNeeded", numNeeded);
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
    //console.log("buildExtensions center mass", JSON.stringify(start));
    start = construction.closestNonWall(gf.roomPosFromPos(start, room.name));
    //console.log("buildExtensions start", JSON.stringify(start));
    //return;
    const structs = room.find(FIND_MY_STRUCTURES);
    for (let i in structs) {
        avoid.push(structs[i].pos)
    }
    const terrain = room.getTerrain();
    //const extensionPos = []
    const skip = 1;
    const extensionPos = construction.looseSpiral(start, numNeeded + skip, avoid, terrain,1);
    //if (extensionPos) {
    //console.log("extension pos", JSON.stringify(extensionPos));
    for ( let i = skip; i < extensionPos.length ; i++ ) {
        result = room.createConstructionSite(extensionPos[i].x, extensionPos[i].y, STRUCTURE_EXTENSION);
        if (result !== OK) {
            //console.log("build extension",i,"result",result,"at",JSON.stringify(extensionPos[i]));
            //console.log("buildExtensions build extension failed result", result.toString());
        }
    }
    //}
};

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    //console.log("POLICY_BUILD_EXTENSIONS draftReplacment finsihed", this.m.finished)
    return this.m.finished ? false : this;
    /*
    const room = Game.rooms[this.home];
    const rcl = room.controller.level;
    const allowedExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl];
    const extensions = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    if (extensions === allowedExtensions) {
        console.log("POLICY_BUILD_EXTENSIONS draftReplacment fail","extensions",extensions,"allowedExtensions",allowedExtensions )
        return this
    } else {
        console.log("POLICY_BUILD_EXTENSIONS draftReplacment this","extensions",extensions,"allowedExtensions",allowedExtensions )
        return this;
    }
    */
};

module.exports = Policy;