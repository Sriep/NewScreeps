/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");

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
            if (!room.memory.policy) {
                if (room.controller && room.controller.my) {
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

    activatePolicy: function(policyType, data) {
        console.log("policy activatePolicy type", policyType, "data", JSON.stringify(data));
        data.id = this.getNextPolicyId();
        const policyConstructor = require("policy_" + policyType);
        const policy = new policyConstructor(data);
        if (data.id > 3) {
            console.log("policytype", policyType, "data", JSON.stringify(data));
            gf.fatalError("activatePolicy tempory stop policy spamming data id", data.id)
        }
        Memory.policies[policy.id] = policy;
        try {
            if (policy.initilise()) {
                Memory.nextPolicyId = Memory.nextPolicyId +1;
            }
        } catch (e) {
            console.log(e);
            delete Memory.policies[policy.id];
            return undefined;
        }
        return policy.id;
    },

    replacePolices: function(policyType, data, parentId, relaceList) {
        for (let id in Memory.policies) {
            if (Memory.policies[id].parentId === parentId) {
                if (parentId.type in relaceList) {
                    delete Memory.policies[id];
                }
            }
        }
        this.activatePolicy(policyType, data);
    },

    hasChild(parentId, typeArray) {
        if (!parentId || !typeArray) {
            return false;
        }
        for (let id in Memory.policies) {
            if (Memory.policies[id].parentId === parentId) {
                if (parentId.type in typeArray) {
                    return true;
                }
            }
        }
        return false;
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

    sendOrderToQueue : function(room, race, energy, policyId, priority) {
        const data = {
            body: race.body(race, energy),
            name: race + "_" + energy.toString(),
        };
        const queue = flag.getSpawnQueue(room);
        return queue.addSpawn(data, priority,  race + "_idle", policyId);
    },

    existingOrders: function(room) {
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