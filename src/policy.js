/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const policy = {

    enactPolicies: function() {
        //console.log("before Memory.policies", Memory.policies)
        if (undefined === Memory.policies) {
            Memory.policies = {};
            //console.log("after Memory.policies", Memory.policies)
        }
        this.checkRoomPolicies();
        for (let policyId in Memory.policies) {
            //console.log("enacting policy",  policy);
            this.enact(policyId);
        }
    },

    enact: function(policyId) {
        const policyData = Memory.policies[policyId];
        const policyConstructor = require("policy_" + policyData.type);
        const policy = new policyConstructor(policyData);
        policy.enact();
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

    getNextPolicyId: function() {
        if (Memory.nextPolicyId === undefined) {
            Memory.nextPolicyId = 1;
        }
        let latestId = Memory.nextPolicyId;
        Memory.nextPolicyId = Memory.nextPolicyId +1;
        //console.log("next policy id", latestId);
        return latestId;
    },

    activatePolicy: function(policyType, data) {
        //console.log("activating policy", policyType, "with data", JSON.stringify(data))

        const policyConstructor = require("policy_" + policyType);
        data.id = this.getNextPolicyId();
        const policy = new policyConstructor(data);
        Memory.policies[policy.id] = policy;

        return policy.id;
    }
}

module.exports = policy;