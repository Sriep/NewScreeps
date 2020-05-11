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
                        //console.log("replacement for policy", id, "does not initilise");
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
                    //console.log("call activate policy checkRoomPolicies room", roomName);
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

    getRoomEconomyPolicy : function(roomName) {
        for (let id in Memory.policies) {
            if ((Memory.policies[id].home === roomName &&
                gc.ECONOMIES.includes(Memory.policies[id].type))) {
                return this.getPolicy(id);
            }
        }
        return undefined;
    },

    getGouvernerPolicy : function(roomName) {
        for (let id in Memory.policies) {
            if (Memory.policies[id].home === roomName &&
                Memory.policies[id].type === gc.POLICY_GOVERN) {
                return this.getPolicy(id);
            }
        }
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
         if (parentId) {
            Memory.policies[parentId].m.childTypes.push(policyType);
        }
        //console.log("activatePolicy before new policy added", JSON.stringify(Memory.policies));
        Memory.policies[newPolicyId] = policy;
        Memory.nextPolicyId = Memory.nextPolicyId + 1;
        Memory.records.policies.created[Game.time.toString()] = policy.type;
        return policy.id;
    },

    activateReplacePolicy: function(policyType, data, parentId, replaceList) {
          for (let id in Memory.policies) {
            if (Memory.policies[id].parentId === parentId
                && replaceList.includes(Memory.policies[id].type)) {
                this.removePolicy(id);
            }
        }
         this.activatePolicy(policyType, data, parentId);
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
        if (Memory.policies[parentId].m.childTypes) {
             Memory.policies[parentId].childType = Memory.policies[parentId].m.childTypes.filter(
                child => child !== childType
            );
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
        for (let id in Memory.policies) {
             if (Memory.policies[id].type === type && Memory.policies[id].parentId === parentId) {
                return true;
            }
        }
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



























