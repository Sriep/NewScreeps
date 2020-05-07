/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const economy = require("economy");
const construction = require("construction");
const state = require("state");
const policy = require("policy");

function Policy  (data) {
    this.type = gc.POLICY_PEACE;
    this.id = data.id;
    this.roomId = data.roomId;
    this.childTypes = data.childTypes ? data.childTypes : [];
    this.rcl = data.rcl ? data.rcl : Game.rooms[this.roomId].controller.level;
    this.activityIndex = data.activityIndex ? data.activityIndex : 0;
}

Policy.prototype.initilise = function () {
    return true;
};

Policy.prototype.enact = function () {
    const room = Game.rooms[this.roomId];

    if (!this.rcl || this.rcl !== room.controller.level || !this.activityIndex) {
        this.rcl = room.controller.level;
        this.activityIndex = 0;
    } else if (Game.time % gc.BUILD_QUEUE_CHECK_RATE !== 0) {
        return;
    }
    this.actionActivityQueue(room);
};

Policy.prototype.actionActivityQueue = function (room) {
    const rcl = room.controller.level;
    gf.assertEq(rcl, this.rcl, "rcl mismatch");
    //console.log("gc.BUILD_ORDER_RCL", JSON.stringify(gc.BUILD_ORDER_RCL))
    //console.log("memory rcl",Memory.policies[this.id].rcl);
    //console.log("memory rcl activity", gc.BUILD_ORDER_RCL[Memory.policies[this.id].rcl][Memory.policies[this.id].activityIndex]);
    //console.log("activity index", Memory.policies[this.id].activityIndex);
    //console.log("gc.BUILD_ORDER_RCL[1][0]",gc.BUILD_ORDER_RCL[1][0] )
    let activity = gc.BUILD_ORDER_RCL[this.rcl][this.activityIndex];
    //console.log("BORCL[1][0]", gc.BUILD_ORDER_RCL[1][0]);
    //console.log("activity", activity, "rcl", this.rcl,"aIndex",this.activityIndex);
    //const fg = this.buildFcs()
    //console.log("buildfcs", JSON.stringify(fg))
    //console.log("buildfcs worker", JSON.stringify(fg["worker"]), " fc[gc.BUILD_ROAD_SPAWN_CONTROLLER]",  fg[gc.BUILD_ROAD_SPAWN_CONTROLLER])
    if (this.buildFcs()[activity].check(room, activity, this.id)) {
       console.log("pp checked", activity, "result TRUE");
        if (activity !== gc.ACTIVITY_FINISHED) {
            this.activityIndex++;
            this.actionActivityQueue(room);
        }
    } else {
        console.log("pp checked", activity, "result FALSE about to activate", activity);
        this.buildFcs()[activity].build(room, activity, this.id);
    }
};

Policy.prototype.buildFcs = function () {
    fc = {};

    fc[gc.BUILD_ROAD_SPAWN_CONTROLLER] = {
        "build": construction.buildRoadSpawnController,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_CONTROLLER] = {
        "build": construction.buildRoadSourceController,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_SOURCE] = {
        "build": construction.buildRoadSources,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_SPAWN] = {
        "build": construction.buildRoadSourceSpawn,
        "check": construction.roadsBuilt,
    };
    fc[gc.BUILD_ROAD_SOURCE_EXTENSIONS] = {
        "build": construction.buildRoadSourceExtensions,
        "check": construction.roadsBuilt,
    };

    fc[gc.BUILD_CONTROLLER_CONTAINERS] = {
        "build": buildControllerContainer,
        "check": isControllerContainerFinished,
    };
    fc[gc.BUILD_SOURCE_CONTAINERS] = {
        "build": buildSourceContainers,
        "check": areSourceContainersFinished,
    };

    fc[gc.BUILD_EXTENSIONS] = {
        "build": construction.finishBuildingMissingExtensions,
        "check": construction.areExtensionsBuilt
    };

    newPolicy = {
        "build": activateNewPolicy,
        "check": checkPolicy,
    };
    fc[gc.POLICY_RCL1] = newPolicy;
    fc[gc.POLICY_EXPLORE] = newPolicy;
    fc[gc.POLICY_WORKERS] = newPolicy;
    fc[gc.POLICY_HARVESTERS] = newPolicy;
    fc[gc.POLICY_PORTERS] = newPolicy;

    fc[gc.ACTIVITY_FINISHED]  = {
        "build": function(){},
        "check": function(){ return true; },
    };
    return fc;
};

activateNewPolicy = function (room, activity, policyId)  {
    //console.log("pp activateNewPolicy")
    if (gc.ECONOMIES.includes(activity)) {
        policy.replacePolices(
            activity,
            { parentId: policyId },
            policyId,
            gc.ECONOMIES,
        );
    } else {
        policy.activatePolicy(activity, {}, policyId);
    }
};

checkPolicy = function (room, policyType, policyId)  {
    //console.log("pp checkPolcy room", room, "policytype", policyType, "polciyId", policyId,
    //    "result", policy.hasChildType(policyId, policyType));
    return policy.hasChildType(policyId, policyType);
};

isControllerContainerFinished = function (room) {
    const flag = Game.flags[room.controller.id];
    const pos = flag.memory.containerPos;
    if (!pos) {
        return false;
    }
    return undefined !== state.findContainerAt(gf.roomPosFromPos(pos, room.name));
};

buildControllerContainer = function (room) {
    const controllerFlag = Game.flags[room.controller.id];
    if (controllerFlag.memory.containerPos) {
        return;
    }
    let spots = economy.findMostFreeNeighbours(
        room, room.controller.pos, 2
    );
    if (spots.length === 0) {
        return gf.fatalError("findMostFreeNeighbours cant get to controller");
    }

    controllerFlag.memory.upgraderPosts = spots[0].neighbours;
    spots[0].pos.roomName = room.name;
    controllerFlag.memory.containerPos = spots[0].pos;
    if (state.findContainerOrConstructionAt(gf.roomPosFromPos(spots[0].pos))) {
        return;
    }
    const result = gf.roomPosFromPos(spots[0].pos).createConstructionSite(STRUCTURE_CONTAINER);
    if (result !== OK) {
        console.log("spot", JSON.stringify(spots[0]));
        gf.fatalError("controller container construction failed " + result.toString());
    }
};

areSourceContainersFinished = function (room) {
    //console.log("in areSourceContainersFinished")
    const sources = room.find(FIND_SOURCES);
    for (let i in sources) {
        const flag = Game.flags[sources[i].id];
        if (!flag.memory.containerPos) {
            return false
        }
        //console.log("areSourceContainersFinished flag", JSON.stringify(flag.memory.container))
        const container = state.findContainerAt(gf.roomPosFromPos(flag.memory.containerPos));
        //console.log("areSourceContainersFinished container", JSON.stringify(container))
        if (!container) {
            return false;
        }
    }
    return true;
};

buildSourceContainers = function (room) {
    //console.log("in buildSourceContainers")
    const sources = room.find(FIND_SOURCES);
    for (let i in sources) {
        const flag = Game.flags[sources[i].id];
        //console.log("buildSourceContainers flag", JSON.stringify(flag.memory))
        if (!flag.memory.containerPos) {
            buildSourceContainer(sources[i], flag);
        }
    }
};

buildSourceContainer = function (source, flag) {
    //console.log("in buildSourceContainer no es")

    let spots = economy.findMostFreeNeighbours(
        source.room, source.pos, 1
    );
    //console.log("buildSourceContainer spots", JSON.stringify(spots))
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
        console.log("spot", JSON.stringify(spots[0]));
        gf.fatalError("construction failed " + result.toString(),"pos", JSON.stringify(spots[0].pos));
    }
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;
































