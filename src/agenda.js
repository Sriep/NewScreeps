/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gf = require("./gf");
const gc = require("./gc");
const policy = require("./policy");

// todo switch to using an agenda object.
const agenda = {

    enact: function (id, agenda, rcl, index) {
        const item = agenda[rcl][index];
        if (!this.agendaFns()[item.type].check(item.activity, id)) {
            return index;
        }
        this.agendaFns()[item.type].enact(item.activity, id, item.params);
        return index+1;
    },

    agendaFns: function() {
        return {
            [gc.Activity.Flag] : this.newActivity,
            [gc.Activity.Policy] : this.newPolicy,
            [gc.Activity.PolicyBlocker] : this.newBlockerPolicy,
            [gc.Activity.PolicyReplacement] : his.newPolicyReplacment,
            [gc.Activity.Control] : {
                "enact": function(activity) { gf.assert(activity !== gc.ACTIVITY_DISALLOWED) },
                "check": function(){ return false; },
            },
        }
    },

    agendas: {
        default_1: [
            [ { "activity": gc.ACTIVITY_DISALLOWED, type: gc.Activity.Control} ], //0
            [ //1
                { "activity": gc.POLICY_PLAN_BUILDS, type: gc.Activity.PolicyBlocker},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_SPAWN} },
                { "activity": gc.POLICY_RCL1, type: gc.Activity.PolicyReplacement},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control}
            ],
            [ //2
                { "activity": gc.POLICY_PORTERS, type: gc.Activity.PolicyReplacement},
                { "activity" : gc.POLICY_FOREIGN_OFFICE, type: gc.Activity.Policy},
                //{ "activity": gc.ACTIVITY_MINE_COLONIES, type: gc.Activity.Policy},
                //{ "activity": gc.POLICY_EXPLORE, type: gc.Activity.Policy},
                //{ "activity": gc.POLICY_COLONIAL_OFFICE, type: gc.Activity.Policy},
                { "activity": gc.POLICY_BUILD_SOURCE_CONTAINERS, type: gc.Activity.PolicyBlocker},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_CONTROLLER_CONTAINERS, type: gc.Activity.PolicyBlocker},
                { "activity": gc.ACTIVITY_MINE_COLONIES, type: gc.Activity.Flag},
                { "activity": gc.POLICY_COLONIAL_OFFICE, type: gc.Activity.Policy},
                { "activity": gc.POLICY_EXPLORE, type: gc.Activity.Policy},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control}
            ],
            [ //3
                { "activity": gc.ACTIVITY_RESERVED_COLONIES, type: gc.Activity.Flag},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_TOWER}},
                //{ "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                //        "fromFind" :C.FIND_SOURCES,
                //        "toFind" :C.FIND_MY_STRUCTURES,
                //        "toStruct" :C.STRUCTURE_EXTENSION,
                //    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" : C.FIND_SOURCES,
                        "toFind" : C.FIND_MY_SPAWNS,
                    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" : C.FIND_SOURCES,
                        "toFind" : C.FIND_SOURCES,
                    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_STRUCTURES,
                        "toStruct" :C.STRUCTURE_CONTROLLER,
                    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_STRUCTURES,
                        "toStruct" :C.STRUCTURE_CONTROLLER,
                    }},
                //{ "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                //        "fromFind" :C.FIND_SOURCES,
                //        "toFind" :C.FIND_STRUCTURES,
                //        "toStruct" :C.STRUCTURE_TOWER,
                //    }},
                { "activity": gc.ACTIVITY_COLONY_ROADS, type: gc.Activity.Flag},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control},
            ],
            [ //4
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_STORAGE}},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_MY_STRUCTURES,
                        "toStruct" :C.STRUCTURE_EXTENSION,
                    }},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control}
            ],
            [ //5
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LINK}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_TOWER}},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_MY_STRUCTURES,
                        "toStruct" :C.STRUCTURE_EXTENSION,
                    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_STRUCTURES,
                        "toStruct" :C.STRUCTURE_TOWER,
                    }},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control},
            ],
            [ //6
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_EXTRACTORS, type: gc.Activity.PolicyBlocker},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LINK}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LAB}},
                { "activity": gc.POLICY_LABS, type: gc.Activity.Policy},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_MY_STRUCTURES,
                        "toStruct" :C.STRUCTURE_EXTENSION,
                    }},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control}
            ],
            [ //7
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_SPAWN}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LINK}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LAB}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_TOWER}},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_MY_STRUCTURES,
                        "toStruct" :C.STRUCTURE_EXTENSION,
                    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_STRUCTURES,
                        "toStruct" :C.STRUCTURE_TOWER,
                    }},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_TERMINAL}},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control}
            ],
            [ //8
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_SPAWN}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LINK}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_LAB}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_TOWER}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_POWER_SPAWN}},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_OBSERVER}},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_MY_STRUCTURES,
                        "toStruct" :C.STRUCTURE_EXTENSION,
                    }},
                { "activity": gc.POLICY_BUILD_ROADS, type: gc.Activity.PolicyBlocker, "params" : {
                        "fromFind" :C.FIND_SOURCES,
                        "toFind" :C.FIND_STRUCTURES,
                        "toStruct" :C.STRUCTURE_TOWER,
                    }},
                { "activity": gc.ACTIVITY_FINISHED, type: gc.Activity.Control}
            ],
        ],
    },



    items : function () {
        const fc = {};
        fc[gc.POLICY_BUILD_ROADS] = newBlockerPolicy;
        // fc[gc.POLICY_BUILD_ROADS] = skip;
        fc[gc.POLICY_BUILD_STRUCTURE] = newBlockerPolicy;
        fc[gc.POLICY_PLAN_BUILDS] = newBlockerPolicy;
        fc[gc.POLICY_EXPLORE] = newPolicy;
        fc[gc.POLICY_LABS] = newPolicy;
        fc[gc.POLICY_COLONIAL_OFFICE] = newPolicy;
        fc[gc.POLICY_FOREIGN_OFFICE] = newPolicy;
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