/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const race = require("race");
const flag = require("flag");

const policy = {

    enactPolicies: function() {
        if (undefined === Memory.policies) {
            Memory.policies = {};
        }
        this.checkRoomPolicies();
        for (let id in Memory.policies) {
            //console.log("enact policies id", id, "type", Memory.policies[id].type);
            const Policy = require("policy_" + Memory.policies[id].type);
            const policy = new Policy(id, Memory.policies[id]);

            const replacement = policy.draftReplacment();
            if (replacement && replacement.type) {
                if (replacement.type !== policy.type) {
                    this.removeFromParentChildList(policy.parentId, policy.type);
                    //console.log("enactPolicies replace policy with", JSON.stringify(replacement));
                    if (!replacement.policy.initilise()) {
                        console.log("replacement for policy", id, "does not initilise");
                        Memory.records.policies.replaced[Game.time.toString()] = {
                            "time" : Game.time,
                            "old" : policy.type,
                        };
                        continue;
                    }
                    Memory.records.policies.replaced[Game.time.toString()] = {
                        "time" : Game.time,
                        "old" : policy.type,
                        "new" : replacement.type,
                    };
                    Memory.policies[id] = replacement;
                }
                replacement.enact();
            } else {
                //console.log("enactPolicies delete policy", id);
                Memory.records.policies.replaced[Game.time.toString()] = {
                    "time" : Game.time,
                    "old" : policy.type,
                };
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
            Memory.records.policies.initilise_failed[Game.time.toString()] = policy.type;
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
        Memory.records.policies.created[Game.time.toString()] = policy.type;
        return policy.id;
    },

    activateReplacePolicy: function(policyType, data, parentId, replaceList) {
        //console.log("replace policy type", policyType,"data",JSON.stringify(data),"parentId",parentId, "replacelist",JSON.stringify(replaceList));
        //console.log("all policies", JSON.stringify(Memory.policies));
        for (let id in Memory.policies) {
            //console.log("replacePolices for loop id", id, "parnetId", Memory.policies[id]);
            if (Memory.policies[id].parentId === parentId
                && replaceList.includes(Memory.policies[id].type)) {
                //console.log("replacePolices deleting id",id,"type",Memory.policies[id].type,"list",JSON.stringify(replaceList));
                this.removePolicy(id);
            }
        }
        //console.log("all policies after filter", JSON.stringify(Memory.policies));
        //console.log("parentId", parentId);

        this.activatePolicy(policyType, data, parentId);
        //console.log("all policies after activate replacement", JSON.stringify(Memory.policies));
    },

    removePolicy: function(id) {
        //console.log("policy remove policy", id, "type",Memory.policies[id].type);
        this.removeFromParentChildList(Memory.policies[id].parentId, Memory.policies[id].type)   ;
        delete Memory.policies[id];
        Memory.records.policies.replaced[Game.time.toString()] = {
            "time" : Game.time,
            "old" : policy.type,
        };
    },

    removeFromParentChildList: function(parentId, childType) {
        //console.log("policy removeFromParentChildList", parentId, childType,
        //    "childlist", JSON.stringify(Memory.policies[parentId].m.childTypes));
        if (Memory.policies[parentId].m.childTypes) {
            //console.log("childtype",childType,"childlist before filter",JSON.stringify(Memory.policies[parentId].m.childTypes));
            Memory.policies[parentId].childType = Memory.policies[parentId].m.childTypes.filter(
                child => child !== childType
            );
            //console.log("childtype",childType,"childlist after filter",JSON.stringify(Memory.policies[parentId].m.childTypes));
        }
    },

    iterateChildren: function(parentId, fn) {
        for (let id in Memory.policies) {
            if (Memory.policies[id].parentId === parentId) {
                 fn(this.getPolicy(id));
            }
        }
    },

    hasChildType: function(parentId, type) {
        //console.log("policy hasChildType, parentId", parentId, "type", type);
        //console.log("policy hasChildType find result", _.find(Memory.policies[parentId].childTypes,
        //        childType  =>
        //    type === childType
        //));
        // return undefined means can't find anythig that matchs
        // parnet has policy that matches type
        //const parent  = Memory.policies[parentId];
        //console.log("hasChildType before all policies", JSON.stringify(Memory.policies));
        for (let id in Memory.policies) {
            //console.log("hasChildType testing id", id, "type ",Memory.policies[id].type,"parentId, ",Memory.policies[id].parentId,"obj", JSON.stringify(Memory.policies[id]))
            if (Memory.policies[id].type === type && Memory.policies[id].parentId === parentId) {
                //console.log("hasChildType id",id," returns true");
                return true;
            }
        }
        //console.log("hasChildType returns false");
        return false;
    },

    getCreeps: function(policyId, cRace) {
        if (cRace) {
            return _.filter(Game.creeps, function (creep) {
                return creep.memory.policyId === policyId
                    && race.getRace(creep) === cRace
            });
        } else {
            return _.filter(Game.creeps, function (creep) {
                return creep.memory.policyId === policyId
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



























