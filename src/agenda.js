/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");

const agenda = {
    peace: [
        [ gc.ACTIVITY_DISALLOWED ],
        [ gc.POLICY_RCL1, gc.ACTIVITY_FINISHED ],
        [
            gc.POLICY_WORKERS,
            gc.POLICY_EXPLORE,
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_HARVESTERS,
            gc.BUILD_SOURCE_CONTAINERS,
            gc.BUILD_CONTROLLER_CONTAINERS,
            gc.POLICY_PORTERS,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.BUILD_TOWER, //todo
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.BUILD_ROAD_SOURCE_SPAWN,
            gc.BUILD_ROAD_SOURCE_SOURCE,
            gc.BUILD_ROAD_SOURCE_CONTROLLER,
            gc.BUILD_ROAD_SPAWN_CONTROLLER,
            gc.BUILD_ROAD_SOURCE_TOWERS,
            gc.ACTIVITY_FINISHED
        ],
        [  gc.ACTIVITY_FINISHED ],
        [  gc.ACTIVITY_FINISHED ],
        [  gc.ACTIVITY_FINISHED ],
        [  gc.ACTIVITY_FINISHED ],
        [  gc.ACTIVITY_FINISHED ],
    ],

    items : function () {
        const fc = {};
        fc[gc.BUILD_ROAD_SPAWN_CONTROLLER] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_CONTROLLER] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_SOURCE] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_SPAWN] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_EXTENSIONS] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_TOWERS] = newBuildRoadBlockerPolicy;
        fc[gc.POLICY_EXPLORE] = newPolicy;
        fc[gc.POLICY_RCL1] = newPolicyReplacment;
        fc[gc.POLICY_WORKERS] = newPolicyReplacment;
        fc[gc.POLICY_HARVESTERS] = newPolicyReplacment;
        fc[gc.POLICY_PORTERS] = newPolicyReplacment;
        fc[gc.BUILD_CONTROLLER_CONTAINERS] = newBlockerPolicy;
        fc[gc.BUILD_SOURCE_CONTAINERS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_EXTENSIONS] = newBlockerPolicy;
        fc[gc.ACTIVITY_FINISHED]  = {
            "enact": function(){},
            "check": function(){ return false; },
        };
        fc[gc.ACTIVITY_DISALLOWED] = {
            "enact": function(){ gf.fatalError("activity not allowed at this rcl")},
            "check": function(){ return true; },
        };
        return fc;
    }

};

const activateNewPolicy = function (room, activity, policyId)  {
    policy.activatePolicy(activity, {}, policyId);
};

const activateNewRoadsPolicy = function (room, activity, policyId, roads)  {
    policy.activatePolicy(gc.POLICY_BUILD_ROADS, {"roads" : activity}, policyId);
};

const newBuildRoadBlockerPolicy = {
    "build": activateNewRoadsPolicy,
    "check": function (room, policyType, policyId)  {
        console.log("check activateNewRoadsPolicy", room.name, "policyType", policyType, "policyId", policyId)
        //const phct = policy.hasChildType(policyId, policyType)
        console.log("check result of check", phct)
        return policy.hasChildType(policyId, gc.POLICY_BUILD_ROADS);
    },
};

const activateNewReplacmentPolicy = function (room, activity, policyId)  {
    policy.replacePolices(
        activity,
        { parentId: policyId },
        policyId,
        gc.ECONOMIES,
    );
};

const newPolicy = {
    "enact": activateNewPolicy,
    "check": function(){ console.log("check return true"); return true; },
};

const newPolicyReplacment ={
    "enact": activateNewReplacmentPolicy,
    "check": function (room, policyType, policyId)  {
        console.log("check newPolicyReplacment room", room.name, "policyType", policyType, "policyId", policyId);
        return policy.hasChildType(policyId, policyType);
    },
};

const newBlockerPolicy = {
    "enact": activateNewPolicy,
    "check": function (room, policyType, policyId)  {
        console.log("check newPolicyReplacment room", room.name, "policyType", policyType, "policyId", policyId);
        return policy.hasChildType(policyId, policyType);
    },
};



module.exports = agenda;