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
            //gc.POLICY_WORKERS,
            gc.POLICY_HARVESTERS,
            gc.POLICY_BUILD_SOURCE_CONTAINERS,
            gc.POLICY_EXPLORE,
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_BUILD_CONTROLLER_CONTAINERS,
            gc.POLICY_PORTERS,
            gc.ACTIVITY_FINISHED
        ],
        [
            gc.POLICY_BUILD_EXTENSIONS,
            gc.POLICY_BUILD_TOWER, //todo
            gc.BUILD_ROAD_SOURCE_EXTENSIONS,
            gc.BUILD_ROAD_SOURCE_SPAWN,
            gc.BUILD_ROAD_SOURCE_SOURCE,
            gc.BUILD_ROAD_SOURCE_CONTROLLER,
            gc.BUILD_ROAD_SPAWN_CONTROLLER,
            gc.BUILD_ROAD_SOURCE_TOWERS, 
            gc.ACTIVITY_FINISHED
        ],
        [  gc.POLICY_BUILD_EXTENSIONS, gc.ACTIVITY_FINISHED ],
        [  gc.POLICY_BUILD_EXTENSIONS, gc.ACTIVITY_FINISHED ],
        [  gc.POLICY_BUILD_EXTENSIONS, gc.ACTIVITY_FINISHED ],
        [  gc.POLICY_BUILD_EXTENSIONS, gc.ACTIVITY_FINISHED ],
        [  gc.POLICY_BUILD_EXTENSIONS, gc.ACTIVITY_FINISHED ],
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
        fc[gc.POLICY_BUILD_CONTROLLER_CONTAINERS] = newBlockerPolicy;
        fc[gc.POLICY_BUILD_SOURCE_CONTAINERS] = newBlockerPolicy;
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
// agenda.items()[nextAgendaItem].enact(room, agendaItem, this.id);
// activatePolicy: function(policyType, data, parentId)
const activateNewPolicy = function (room, agendaItem, parnetId)  {
    //console.log("agenda activate new policy agendaItem", agendaItem, "parnetId", parnetId);
    policy.activatePolicy(agendaItem, {}, parnetId);
};

const activateNewRoadsPolicy = function (room, agendaItem, parnetId)  {
    //console.log("agenda activateNewRoadsPolicy", agendaItem, parnetId, roads);
    policy.activatePolicy(gc.POLICY_BUILD_ROADS, {"roads" : agendaItem}, parnetId);
};

const newBuildRoadBlockerPolicy = {
    "build": activateNewRoadsPolicy,
    "check": function (room, agendaItem, parnetId)  {
        //console.log("agenda check activateNewRoadsPolicy", room.name, "policyType", agendaItem, "policyId", parnetId)
        //const phct = policy.hasChildType(policyId, policyType)
        //console.log("agenda check result of check", phct)
        return policy.hasChildType(parnetId, gc.POLICY_BUILD_ROADS);
    },
};

const activateNewReplacementPolicy = function (room, agendaItem, parnetId)  {
    //console.log("agenda activate new replacement policy agendaItem", agendaItem, "parnetId", parnetId);
    policy.activateReplacePolicy(
        agendaItem,
        { parentId: parnetId },
        parnetId,
        gc.ECONOMIES,
    );
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
    "check": function (room, agendaItem, parnetId)  {
        //console.log("agenda check newBlockerPolicy room", room.name, "policyType", agendaItem, "policyId", parnetId);
        const hasChildType = policy.hasChildType(parnetId, agendaItem);
        //console.log("agenda check",agendaItem," newBlockerPolicy",hasChildType);
        return !hasChildType;
    },
};



module.exports = agenda;