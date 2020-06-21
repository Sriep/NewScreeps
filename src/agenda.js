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
        if (index >= 0) {
            if (index >= agenda[rcl].length) {
                return index;
            }
            if (!this.agendaFns()[agenda[rcl][index].type].check.call(
                this,
                agenda[rcl][index].activity,
                id
            )) {
                return index
            }
            index++
        } else {
            index = 0;
        }
        this.agendaFns()[agenda[rcl][index].type].enact.call(
            this,
            agenda[rcl][index].activity,
            id,
            agenda[rcl][index].params
        );
        return index;
    },

    agendaFns: function() {
        return {
            [gc.Activity.Flag] : {
                "enact": function (activity, parnetId) {
                    policy.getPolicy(parnetId).m[activity] = true;
                },
                "check": function() { return true; },
            },
            [gc.Activity.Policy] : {
                "enact": this.activateNewPolicy,
                "check": function() { console.log("agenda check return true"); return true; },
            },
            [gc.Activity.PolicyBlocker] : {
                "enact": this.activateNewPolicy,
                "check": function (activity, parnetId)  {
                    return !policy.hasChildType(parnetId, activity);
                }
            },
            [gc.Activity.PolicyReplacement] : {
                "enact": this.activateNewReplacementPolicy,
                "check": function() { return true; },
            },
            [gc.Activity.Control] : {
                "enact": function(activity) { gf.assert(activity !== gc.ACTIVITY_DISALLOWED) },
                "check": function(){ return false; },
            },
        }
    },

    activateNewReplacementPolicy : function ( activity, parentId)  {
        //console.log("activateNewReplacementPolicy activity",activity,"id",parentId);
        policy.activateReplacePolicy(
            activity,
            {},
            parentId,
            gc.ECONOMIES,
        );
    },

    activateNewPolicy : function ( activity, parentId, params)  {
        //console.log("activateNewPolicy activity",activity,"id",parentId, "params", JSON.stringify(params));
        policy.activatePolicy(activity, params ? params : {}, parentId);
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
                { "activity": gc.POLICY_HARVESTERS, type: gc.Activity.PolicyReplacement},
                { "activity": gc.POLICY_BUILD_SOURCE_CONTAINERS, type: gc.Activity.PolicyBlocker},
                //{ "activity": gc.ACTIVITY_MINE_COLONIES, type: gc.Activity.Policy},
                //{ "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_PORTERS, type: gc.Activity.PolicyReplacement},
                { "activity": gc.POLICY_BUILD_STRUCTURE, type: gc.Activity.PolicyBlocker, "params": {"structureType":C.STRUCTURE_EXTENSION}},
                { "activity": gc.POLICY_EXPLORE, type: gc.Activity.Policy},
                { "activity": gc.POLICY_BUILD_CONTROLLER_CONTAINERS, type: gc.Activity.PolicyBlocker},
                { "activity" : gc.POLICY_FOREIGN_OFFICE, type: gc.Activity.Policy},
                //{ "activity": gc.POLICY_EXPLORE, type: gc.Activity.Policy},
                { "activity": gc.POLICY_COLONIAL_OFFICE, type: gc.Activity.Policy},
                { "activity": gc.ACTIVITY_MINE_COLONIES, type: gc.Activity.Flag},
                //{ "activity": gc.POLICY_COLONIAL_OFFICE, type: gc.Activity.Policy},
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
                { "activity": gc.ACTIVITY_SCIENTIST, type: gc.Activity.Flag},
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

};

module.exports = agenda;