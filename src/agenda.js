/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

const agenda = {
    default_1: [
        [ { "activity": gc.ACTIVITY_DISALLOWED} ],
        [
            { "activity": gc.POLICY_PLAN_BUILDS},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_SPAWN} },
            { "activity": gc.POLICY_RCL1},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [
            { "activity": gc.POLICY_PORTERS},
            { "activity": gc.POLICY_BUILD_SOURCE_CONTAINERS},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_CONTROLLER_CONTAINERS},
            { "activity": gc.ACTIVITY_NEUTRAL_COLONIES},
            //{ "activity": gc.POLICY_EXPLORE},
            { "activity": gc.POLICY_COLONIAL_OFFICE},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_STRUCTURES,
                    "toStruct" : STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_SPAWNS,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_SOURCES,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_STRUCTURES,
                    "toStruct" : STRUCTURE_CONTROLLER,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_STRUCTURES,
                    "toStruct" : STRUCTURE_CONTROLLER,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_STRUCTURES,
                    "toStruct" : STRUCTURE_TOWER,
                }},
            { "activity": gc.ACTIVITY_RESERVED_COLONIES},
            { "activity": gc.ACTIVITY_FINISHED},
        ],
        [
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_STRUCTURES,
                    "toStruct" : STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_STORAGE}},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_STRUCTURES,
                    "toStruct" : STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_STRUCTURES,
                    "toStruct" : STRUCTURE_TOWER,
                }},
            { "activity": gc.ACTIVITY_FINISHED},
        ],
        [
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LAB}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_STRUCTURES,
                    "toStruct" : STRUCTURE_EXTENSION,
                }},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_SPAWN}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LAB}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_STRUCTURES,
                    "toStruct" : STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_STRUCTURES,
                    "toStruct" : STRUCTURE_TOWER,
                }},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_TERMINAL}},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_SPAWN}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_LAB}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_MY_STRUCTURES,
                    "toStruct" : STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_POWER_SPAWN}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":STRUCTURE_OBSERVER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : FIND_SOURCES,
                    "toFind" : FIND_STRUCTURES,
                    "toStruct" : STRUCTURE_TOWER,
                }},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
    ],

    items : function () {
        const fc = {};
        fc[gc.POLICY_BUILD_ROADS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_STRUCTURE] = newBlockerPolicy;
        fc[gc.POLICY_PLAN_BUILDS] = newBlockerPolicy;
        //fc[gc.BUILD_ROAD_SPAWN_CONTROLLER] = newBuildRoadBlockerPolicy;
        //fc[gc.BUILD_ROAD_SOURCE_CONTROLLER] = newBuildRoadBlockerPolicy;
        //fc[gc.BUILD_ROAD_SOURCE_SOURCE] = newBuildRoadBlockerPolicy;
        //fc[gc.BUILD_ROAD_SOURCE_SPAWN] = newBuildRoadBlockerPolicy;
        //fc[gc.BUILD_ROAD_SOURCE_EXTENSIONS] = newBuildRoadBlockerPolicy;
        //fc[gc.BUILD_ROAD_SOURCE_TOWERS] = newBuildRoadBlockerPolicy;
        fc[gc.POLICY_EXPLORE] = newPolicy;
        fc[gc.POLICY_COLONIAL_OFFICE] = newPolicy;
        fc[gc.POLICY_RCL1] = newPolicyReplacment;
        fc[gc.POLICY_WORKERS] = newPolicyReplacment;
        fc[gc.POLICY_HARVESTERS] = newPolicyReplacment;
        fc[gc.POLICY_PORTERS] = newPolicyReplacment;
        fc[gc.POLICY_BUILD_CONTROLLER_CONTAINERS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_SOURCE_CONTAINERS] = newBlockerPolicy;
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
// {"structureType":STRUCTURE_SPAWN}
const activateNewPolicy = function ( activity, parnetId, params)  {
     policy.activatePolicy(activity, params ? params : {}, parnetId);
};

//const activateNewRoadsPolicy = function ( activity, parnetId)  {
//    console.log("agenda activateNewRoadsPolicy", activity, parnetId);
//    policy.activatePolicy(gc.POLICY_BUILD_ROADS, {"roads" : activity}, parnetId);
//};

const activateNewReplacementPolicy = function ( activity, parnetId)  {
   policy.activateReplacePolicy(
       activity,
        { parentId: parnetId },
        parnetId,
        gc.ECONOMIES,
    );
};

//const newBuildRoadBlockerPolicy = {
//    "enact": activateNewRoadsPolicy,
//    "check": function ( _, parnetId)  {
//        return !policy.hasChildType(parnetId, gc.POLICY_BUILD_ROADS);
//    },
//};

const newActivity = {
    "enact": function (activity, parnetId) {
        policy.getPolicy(parnetId).m[activity] = true;
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
    "check": function (activity, parnetId)  {
         return !policy.hasChildType(parnetId, activity);
    },
};



module.exports = agenda;