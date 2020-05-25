/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");

const agenda = {
    default_1: [
        [ gc.ACTIVITY_DISALLOWED ],
        [ gc.POLICY_RCL1, gc.ACTIVITY_FINISHED ],
        [
            gc.POLICY_PORTERS,
            gc.POLICY_BUILD_SOURCE_CONTAINERS,
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_BUILD_CONTROLLER_CONTAINERS,
            gc.ACTIVITY_NEUTRAL_COLONIES,
            gc.POLICY_EXPLORE,
            gc.POLICY_COLONIAL_OFFICE,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_BUILD_TOWER,
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.BUILD_ROAD_SOURCE_SPAWN,
            gc.BUILD_ROAD_SOURCE_SOURCE,
            gc.BUILD_ROAD_SOURCE_CONTROLLER,
            gc.BUILD_ROAD_SPAWN_CONTROLLER,
            gc.BUILD_ROAD_SOURCE_TOWERS,
            gc.ACTIVITY_RESERVED_COLONIES,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.POLICY_BUILD_STORAGE,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_BUILD_LINKS,
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.POLICY_BUILD_TOWER,
            gc.BUILD_ROAD_SOURCE_TOWERS,
            gc.ACTIVITY_FINISHED,
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_BUILD_LINKS,
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            //gc.POLICY_BUILD_LINKS,
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.POLICY_BUILD_TOWER,
            gc.BUILD_ROAD_SOURCE_TOWERS,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            //gc.POLICY_BUILD_LINKS,
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.POLICY_BUILD_TOWER,
            gc.BUILD_ROAD_SOURCE_TOWERS,
            gc.ACTIVITY_FINISHED
        ],
    ],

    items : function () {
        const fc = {};
        fc[gc.BUILD_ROAD_SPAWN_CONTROLLER] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_CONTROLLER] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_SOURCE] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_SPAWN

            ] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_EXTENSIONS] = newBuildRoadBlockerPolicy;
        fc[gc.BUILD_ROAD_SOURCE_TOWERS] = newBuildRoadBlockerPolicy;
        fc[gc.POLICY_EXPLORE] = newPolicy;
        fc[gc.POLICY_COLONIAL_OFFICE] = newPolicy;
        fc[gc.POLICY_RCL1] = newPolicyReplacment;
        fc[gc.POLICY_WORKERS] = newPolicyReplacment;
        fc[gc.POLICY_HARVESTERS] = newPolicyReplacment;
        fc[gc.POLICY_PORTERS] = newPolicyReplacment;
        fc[gc.POLICY_BUILD_CONTROLLER_CONTAINERS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_SOURCE_CONTAINERS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_EXTENSIONS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_TOWER] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_STORAGE] = newBlockerPolicy;
        fc[gc.ACTIVITY_NEUTRAL_COLONIES] = newActivity;
        fc[gc.ACTIVITY_RESERVED_COLONIES] = newActivity;
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
const activateNewPolicy = function ( agendaItem, parnetId)  {
     policy.activatePolicy(agendaItem, {}, parnetId);
};

const activateNewRoadsPolicy = function ( agendaItem, parnetId)  {
    console.log("agenda activateNewRoadsPolicy", agendaItem, parnetId);
    policy.activatePolicy(gc.POLICY_BUILD_ROADS, {"roads" : agendaItem}, parnetId);
};

const newBuildRoadBlockerPolicy = {
    "enact": activateNewRoadsPolicy,
    "check": function ( agendaItem, parnetId)  {
         return !policy.hasChildType(parnetId, gc.POLICY_BUILD_ROADS);
    },
};

const activateNewReplacementPolicy = function ( agendaItem, parnetId)  {
   policy.activateReplacePolicy(
        agendaItem,
        { parentId: parnetId },
        parnetId,
        gc.ECONOMIES,
    );
};

const newActivity = {
    "enact": function (agendaItem, parnetId) {
        policy.getPolicy(parnetId).m[agendaItem] = true;
    },
    "check": function(){ return true; },
};

const newPolicy = {
    "enact": activateNewPolicy,
    "check": function(){ console.log("agenda check return true"); return true; },
};

const newPolicyReplacment ={
    "enact": activateNewReplacementPolicy,
    "check": function(){ return true; },
};

const newBlockerPolicy = {
    "enact": activateNewPolicy,
    "check": function (agendaItem, parnetId)  {
         return !policy.hasChildType(parnetId, agendaItem);
    },
};



module.exports = agenda;