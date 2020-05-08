/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const race = require("race");
const flag = require("flag");

const policy = {

    enactPolicies: function() {
        if (undefined === Memory.policies) {
            Memory.policies = {};
        }
        this.checkRoomPolicies();
        for (let id in Memory.policies) {
            console.log("enact policies id", id, "type", Memory.policies[id].type);
            const Policy = require("policy_" + Memory.policies[id].type);
            const policy = new Policy(id, Memory.policies[id]);

            const replacement = policy.draftReplacment();
            if (replacement) {
                if (replacement.type !== policy.type) {
                    this.removeFromParnetChildList(policy.parentId, policy.type);
                    console.log("enactPolicies replace policy with", JSON.stringify(replacement));
                    replacement.policy.initilise();
                }
                replacement.enact();
                Memory.policies[id] = replacement;
            } else {
                console.log("enactPolicies delete policy", id);
                delete Memory.policies[id];
            }
        }
    },

    checkRoomPolicies: function() {
        for(let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (!room.memory.policy || !Memory.policies[room.memory.policy] ) {
                if (room.controller && room.controller.my) {
                    console.log("call activate policy checkRoomPolicies room", roomName);
                    room.memory.policy = this.activatePolicy(gc.POLICY_GOVERN, {roomName: roomName})
                } else {
                    //room.memory.policy = this.activatePolicy(gc.POLICY_NEUTRAL_ROOM, {roomId: roomId})
                }
            }
        }
    },

    isPolicy: function(parentId, type) {
        for ( let i in Memory.policies) {
            if (Memory.policies[i].type === type &&
                Memory.policies[i].parentId === parentId) {
                return true;
            }
        }
    },

    getPolicy: function(id) {
        const data = Memory.policies[id];
        const Policy = require("policy_" + data.type);
        return new Policy(id, data);
    },

    savePolicy: function(policy) {
        Memory[policy.id] = policy;
    },

    getNextPolicyId: function() {
        if (Memory.nextPolicyId === undefined) {
            Memory.nextPolicyId = 1;
        }
        //Memory.nextPolicyId = Memory.nextPolicyId +1;
        return Memory.nextPolicyId;
    },

    activatePolicy: function(policyType, data, parentId) {
        console.log("activatePolicy type", policyType, "data", JSON.stringify(data), "parentid", parentId);
        if (parentId) {
            data.parentId = parentId;
        }
        const newPolicyId = this.getNextPolicyId();
        const policyConstructor = require("policy_" + policyType);
        //console.log("activatePolicy data", JSON.stringify(data));
        const policy = new policyConstructor(newPolicyId, data);
        //Memory.policies[policy.id] = policy;
        if (!policy.initilise()) {
            console.log("Policy initilise failed no policy added policyType", policyType,
                "data", JSON.stringify(data), "parentId", parentId);
            return undefined;
        }
        //console.log("activatePolicy newPolicyId",newPolicyId ,"policy", JSON.stringify(policy));
        //console.log("Memory", newPolicyId, JSON.stringify(Memory.policies[newPolicyId]));
        if (parentId) {
            Memory.policies[parentId].m.childTypes.push(policyType);
        }
        //console.log("activatePolicy before new policy added", JSON.stringify(Memory.policies));
        Memory.policies[newPolicyId] = policy;
        //console.log("activatePolicy after new policy added", JSON.stringify(Memory.policies));
        Memory.nextPolicyId = Memory.nextPolicyId + 1;
        return policy.id;
    },

    replacePolices: function(policyType, data, parentId, replaceList) {
        console.log("replace policy type", policyType,"data",JSON.stringify(data),"parentId",parentId, "replacelist",replaceList);
        //console.log("all policies", JSON.stringify(Memory.policies));
        for (let id in Memory.policies) {
            //console.log("replacePolices for loop id", id, "parnetId", Memory.policies[id]);
            if (Memory.policies[id].parentId === parentId && replaceList.includes(Memory.policies[id].type)) {
                console.log("replacePolices deleting id",id);
                this.removePolicy(id);
            }
        }
        console.log("all policies after filter", JSON.stringify(Memory.policies));
        console.log("parentId", parentId);
        this.activatePolicy(policyType, data, parentId);
        console.log("all policies after activate replacement", JSON.stringify(Memory.policies));
    },

    removePolicy(id) {
        console.log("policy remove policy", id, "type",id.type);
        this.removeFromParnetChildList(Memory.policies[id].parentId, Memory.policies[id].type)   ;
        delete Memory.policies[id];
    },

    removeFromParnetChildList(parentId, childType) {
        console.log("policy removeFromParnetChildList", parentId, childType);
        if (Memory.policies[parentId].m.childTypes) {
            Memory.policies[parentId].childType = Memory.policies[parentId].m.childTypes.filter(
                child => child !== childType
            );
        }
    },

    hasChildType(parentId, type) {
        console.log("policy hasChildType, parentId", parentId, "type", type);
        console.log("policy hasChildType find result", _.find(Memory.policies[parentId].childTypes,
                childType  =>
            type === childType
        ));
        // return undefined means can't find anythig that matchs
        // parnet has policy that matches type
        return !!(_.find(Memory.policies[parentId].childTypes, childType  =>
            type === childType
        ));
    },

    getCreeps(policyId, race) {
        if (race) {
            return _.filter(Game.creeps, function (creep) {
                return creep.memory.policyId === policyId
            });
        } else {
            return _.filter(Game.creeps, function (creep) {
                return creep.memory.policyId === policyId
                    && race.getRace(creep) === race
            });
        }

    },

    reassignCreeps: function (oldPolicy, newPolicy) {
        for (let creep in Game.creeps) {
            if (Game.creeps[creep].memory.policyId === oldPolicy.id) {
                Game.creeps[creep].memory.policyId = newPolicy.id
            }
        }
    },

    sendOrderToQueue : function(room, cRace, energy, policyId, priority) {
        const data = {
            body: race.body(cRace, energy),
            name: cRace + "_" + energy.toString(),
        };
        const queue = flag.getSpawnQueue(room.name);
        return queue.addSpawn(data, priority, policyId,  cRace + "_idle");
    },

};

module.exports = policy;



























