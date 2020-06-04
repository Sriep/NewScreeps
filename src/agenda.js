/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gf = require("./gf");
const gc = require("./gc");
const policy = require("./policy");


const agenda = {
    default_1: [
        [ { "activity": gc.ACTIVITY_DISALLOWED} ], //0
        [ //1
            { "activity": gc.POLICY_PLAN_BUILDS},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_SPAWN} },
            { "activity": gc.POLICY_RCL1},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [ //2
            { "activity": gc.POLICY_PORTERS},
            //{ "activity": gc.ACTIVITY_NEUTRAL_COLONIES},
            //{ "activity": gc.POLICY_EXPLORE},
            //{ "activity": gc.POLICY_COLONIAL_OFFICE},
            { "activity": gc.POLICY_BUILD_SOURCE_CONTAINERS},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_CONTROLLER_CONTAINERS},
            { "activity": gc.ACTIVITY_MINE_COLONIES},
            { "activity": gc.POLICY_COLONIAL_OFFICE},
            { "activity": gc.POLICY_EXPLORE},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [ //3
            { "activity": gc.ACTIVITY_RESERVED_COLONIES},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_TOWER}},
            //{ "activity": gc.POLICY_BUILD_ROADS, "params" : {
            //        "fromFind" :C.FIND_SOURCES,
            //        "toFind" :C.FIND_MY_STRUCTURES,
            //        "toStruct" :C.STRUCTURE_EXTENSION,
            //    }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : C.FIND_SOURCES,
                    "toFind" : C.FIND_MY_SPAWNS,
            }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" : C.FIND_SOURCES,
                    "toFind" : C.FIND_SOURCES,
            }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_STRUCTURES,
                    "toStruct" :C.STRUCTURE_CONTROLLER,
            }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_STRUCTURES,
                    "toStruct" :C.STRUCTURE_CONTROLLER,
            }},
            //{ "activity": gc.POLICY_BUILD_ROADS, "params" : {
            //        "fromFind" :C.FIND_SOURCES,
            //        "toFind" :C.FIND_STRUCTURES,
            //        "toStruct" :C.STRUCTURE_TOWER,
            //    }},
            { "activity": gc.ACTIVITY_COLONY_ROADS},
            { "activity": gc.ACTIVITY_FINISHED},
        ],
        [ //4
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_STORAGE}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_MY_STRUCTURES,
                    "toStruct" :C.STRUCTURE_EXTENSION,
            }},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [ //5
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_MY_STRUCTURES,
                    "toStruct" :C.STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_STRUCTURES,
                    "toStruct" :C.STRUCTURE_TOWER,
            }},
            { "activity": gc.ACTIVITY_FINISHED},
        ],
        [ //6
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_EXTRACTORS},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LAB}},
            { "activity": gc.POLICY_LABS},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_MY_STRUCTURES,
                    "toStruct" :C.STRUCTURE_EXTENSION,
            }},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [ //7
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_SPAWN}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LAB}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_MY_STRUCTURES,
                    "toStruct" :C.STRUCTURE_EXTENSION,
            }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_STRUCTURES,
                    "toStruct" :C.STRUCTURE_TOWER,
            }},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_TERMINAL}},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
        [ //8
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_EXTENSION}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_SPAWN}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LINK}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_LAB}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_TOWER}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_POWER_SPAWN}},
            { "activity": gc.POLICY_BUILD_STRUCTURE, "params": {"structureType":C.STRUCTURE_OBSERVER}},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_MY_STRUCTURES,
                    "toStruct" :C.STRUCTURE_EXTENSION,
                }},
            { "activity": gc.POLICY_BUILD_ROADS, "params" : {
                    "fromFind" :C.FIND_SOURCES,
                    "toFind" :C.FIND_STRUCTURES,
                    "toStruct" :C.STRUCTURE_TOWER,
            }},
            { "activity": gc.ACTIVITY_FINISHED}
        ],
    ],

    items : function () {
        const fc = {};
        fc[gc.POLICY_BUILD_ROADS] = newBlockerPolicy;
        // fc[gc.POLICY_BUILD_ROADS] = skip;
        fc[gc.POLICY_BUILD_STRUCTURE] = newBlockerPolicy;
        fc[gc.POLICY_PLAN_BUILDS] = newBlockerPolicy;
        fc[gc.POLICY_EXPLORE] = newPolicy;
        fc[gc.POLICY_LABS] = newPolicy;
        fc[gc.POLICY_COLONIAL_OFFICE] = newPolicy;
        fc[gc.POLICY_BUILD_EXTRACTORS] = newPolicy;
        fc[gc.POLICY_RCL1] = newPolicyReplacment;
        fc[gc.POLICY_WORKERS] = newPolicyReplacment;
        fc[gc.POLICY_HARVESTERS] = newPolicyReplacment;
        fc[gc.POLICY_PORTERS] = newPolicyReplacment;
        fc[gc.POLICY_BUILD_CONTROLLER_CONTAINERS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_SOURCE_CONTAINERS] = newBlockerPolicy;
        fc[gc.ACTIVITY_MINE_COLONIES] = newActivity;
        fc[gc.ACTIVITY_RESERVED_COLONIES] = newActivity;
        fc[gc.ACTIVITY_COLONY_ROADS] = newActivity;
        fc[gc.ACTIVITY_FLEXI_HARVESTERS] = newActivity;
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

const activateNewPolicy = function ( activity, parnetId, params)  {
     policy.activatePolicy(activity, params ? params : {}, parnetId);
};

const activateNewReplacementPolicy = function ( activity, parnetId)  {
   policy.activateReplacePolicy(
       activity,
        { parentId: parnetId },
        parnetId,
        gc.ECONOMIES,
    );
};

const skip = {
    "enact": function () {} ,
    "check": function () { return true; }
};

const newActivity = {
    "enact": function (activity, parnetId) {
        policy.getPolicy(parnetId).m[activity] = true;
    },
    "check": function() { return true; },
};

const newPolicy = {
    "enact": activateNewPolicy,
    "check": function() { console.log("agenda check return true"); return true; },
};

const newPolicyReplacment ={
    "enact": activateNewReplacementPolicy,
    "check": function() { return true; },
};

const newBlockerPolicy = {
    "enact": activateNewPolicy,
    "check": function (activity, parnetId)  {
         return !policy.hasChildType(parnetId, activity);
    },
};



module.exports = agenda;