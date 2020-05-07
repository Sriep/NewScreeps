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
            const policyData = Memory.policies[id];
            const Policy = require("policy_" + policyData.type);
            const policy = new Policy(policyData);

            const replacement = policy.draftReplacment();
            if (replacement) {
                if (replacement.type !== policy.type) {
                    replacement.policy.initilise();
                }
                replacement.enact();
                Memory.policies[id] = replacement;
            } else {
                delete Memory.policies[id];
            }
        }
    },

    checkRoomPolicies: function() {
        for(let roomId in Game.rooms) {
            const room = Game.rooms[roomId];
            if (!room.memory.policy || !Memory.policies[room.memory.policy] ) {
                if (room.controller && room.controller.my) {
                    console.log("call activate policy checkRoomPolicies room", roomId);
                    room.memory.policy = this.activatePolicy(gc.POLICY_PEACE, {roomId: roomId})
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
        return new Policy(data);
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
        //console.log("activatePolicy type", policyType, "data", JSON.stringify(data), "parentid", parentId);
        const newPolicyId = this.getNextPolicyId();
        data.id = newPolicyId;
        if (parentId) {
            data.parentId = parentId;
        }
        const policyConstructor = require("policy_" + policyType);
        const policy = new policyConstructor(data);
        Memory.policies[policy.id] = policy;
        if (!policy.initilise()) {
            //console.log("activatePolicy initilise failed no policy added", JSON.stringify(Memory.policies));
            return undefined;
        }
        Memory.policies[newPolicyId] = policy;
        Memory.nextPolicyId = Memory.nextPolicyId + 1;
        if (parentId) {
            Memory.policies[parentId].childTypes.push(policyType);
        }
        //console.log("activatePolicy new policy added", JSON.stringify(Memory.policies));
        return policy.id;
    },

    replacePolices: function(policyType, data, parentId, replaceList) {
        //console.log("replace policy type", policyType,"data",JSON.stringify(data),"parentId",parentId, "replacelist",replaceList);
        //console.log("all policies", JSON.stringify(Memory.policies));
        for (let policy in Memory.policies) {
            if (policy.parent === parentId && replaceList.includes(policy.type)) {
                delete Memory.policies[policy];
            }
        }
        //console.log("all policies after filter", JSON.stringify(Memory.policies));
        //console.log("parentId", parentId,"obj",JSON.stringify(Memory.policies[parentId]))
        Memory.policies[parentId].childType = Memory.policies[parentId].childTypes.filter(
            policyType => !replaceList.includes(policyType)
        );
        this.activatePolicy(policyType, data, parentId);
        //console.log("all policies after activate replacement", JSON.stringify(Memory.policies));
    },

    hasChildType(parentId, type) {
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
    //policy.sendOrderToQueue(
    //    room,
    //    gc.RACE_WORKER,
    //    energy,
    //    this.parentId,
    //    gc.SPAWN_PRIORITY_CRITICAL
    //);
    //addSpawn = function (data, priority, policyId, startState)
    sendOrderToQueue : function(room, cRace, energy, policyId, priority) {
        const data = {
            body: race.body(cRace, energy),
            name: cRace + "_" + energy.toString(),
        };
        const queue = flag.getSpawnQueue(room.name);
        return queue.addSpawn(data, priority, policyId,  cRace + "_idle");
    },

    existingOrders: function(room, policyId) {
        const queue = flag.getSpawnQueue(room);
        const ordersCritial = queue.orders(policyId, gc.SPAWN_PRIORITY_CRITICAL);
        if (ordersCritial.length > 0) {
            return true;
        }
        const ordersLocal = queue.orders(policyId, gc.SPAWN_PRIORITY_LOCAL);
        return ordersLocal.length > 0;
    },
};

module.exports = policy;



























