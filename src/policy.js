/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const gf = require("./gf");
const race = require("./race");
const flag = require("./flag");
const state = require("./state");
const construction = require("./construction");
const FlagRoom = require("./flag_room");
const CreepMemory = require("./creep_memory");
//const _ = require("lodash");

const policy = {

    //M : Memory.policies,

    enactPolicies: function() {
        if (undefined === Memory.policies) {
            Memory.policies = {};
        }
        if (undefined === Memory.policyRates) {
            Memory.policyRates = {};
        }
        this.checkRoomPolicies();
        for (let id in Memory.policies) {
            //Game.time % gc.FLAG_UPDATE_RATE === 0
            //console.log("policy id", id, "Game.time + id",Game.time + id, "Memory.policyRates[id]",Memory.policyRates[id]
            //,"Game.time + id % Memory.policyRates[id] ",(Game.time + id) % Memory.policyRates[id] )
            if ((Game.time + id) % Memory.policyRates[id] !== 0) {
                continue;
            }

            //console.log("enact policies id", id, "type", Memory.policies[id].type);
            //console.log("policy enactPolicies", id, "policy", JSON.stringify(Memory.policies[id]));
            const Policy = require("policy_" + Memory.policies[id].type);
            const policy = new Policy(id, Memory.policies[id]);

            const replacement = policy.draftReplacement();
            //console.log("enactPolicies replacement", replacement);
            if (replacement && replacement.type) {
                //console.log("enactPolicies replacement", replacement, "type", replacement.type);
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
                    "policy" : JSON.stringify(policy)
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
                    room.memory.policy = this.activatePolicy(gc.POLICY_GOVERN, { m:{home: roomName}})
                }
            }
        }
    },

    activatePolicy: function(policyType, data, parentId, policyRate) {
        if (parentId) {
            data.parentId = parentId;
        }
        const newPolicyId = this.getNextPolicyId();
        const policyConstructor = require("policy_" + policyType);
        const policy = new policyConstructor(newPolicyId, data);
        Memory.policyRates[newPolicyId] = policyRate ? policyRate : 1;
        if (!policy.initilise()) {
            delete Memory.policyRates[newPolicyId];
            Memory.records.policies.initilise_failed[Game.time.toString()] = policy.type;
            return undefined;
        }
         if (parentId) {
            Memory.policies[parentId].m.childTypes.push(policyType);
        }
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


    isPolicy: function(parentId, type) {
        for ( let i in Memory.policies) {
            if (Memory.policies[i].type === type &&
                Memory.policies[i].parentId === parentId) {
                return true;
            }
        }
    },

    getPolicy: function(id) {
        const Policy = require("policy_" + Memory.policies[id].type);
        return new Policy(id, Memory.policies[id]);
    },

    getPoliciesByType: function(type) {
        const policies = [];
        for (let id in Memory.policies) {
            if (Memory.policies[id].type === type) {
                policies.push(this.getPolicy(id));
            }
        }
        return policies;
    },

    getPolicyByType: function(type) {
        for (let id in Memory.policies) {
            if (Memory.policies[id].type === type) {
                return this.getPolicy(id);
            }
        }
        return undefined;
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
            //console.log("getGouvernerPolicy home", home, "home",
            //     Memory.policies[id].home, "type", Memory.policies[id].type);
            if (Memory.policies[id].m.home === roomName &&
                Memory.policies[id].type === gc.POLICY_GOVERN) {
                return this.getPolicy(id);
            }
        }
        //console.log("getGouvernerPolicy dropped though", home)
        return undefined;
    },

    getMiningPolicy :  function(roomName) {
        for (let id in Memory.policies) {
            if (Memory.policies[id].home === roomName &&
                Memory.policies[id].type === gc.POLICY_MINE_ROOM) {
                return this.getPolicy(id);
            }
        }
        return undefined;
    },

    removePolicy: function(id) {
        //console.log("policy remove policy", id, "type",Memory.policies[id].type);
        this.removeFromParentChildList(Memory.policies[id].parentId, Memory.policies[id].type)   ;
        delete Memory.policies[id];
        delete Memory.policyRates[id];
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
        //console.log("policy hasChildType parentId",parentId, "type",type);
        for (let id in Memory.policies) {
             if (Memory.policies[id].type === type
                 && Memory.policies[id].parentId === parentId) {
                return true;
            }
        }
        return false;
    },

    getCreeps: function(policyId, cRace) {
        if (cRace) {
            return _.filter(Game.creeps, function (creep) {
                return CreepMemory.M(creep).policyId === policyId
                    && race.getRace(creep) === cRace
            });
        } else {
            return _.filter(Game.creeps, function (creep) {
                return CreepMemory.M(creep).policyId === policyId
            });
        }

    },

    reassignCreeps: function (oldPolicy, newPolicy) {
        for (let creep in Game.creeps) {
            if (CreepMemory.M(Game.creeps[creep]).policyId === oldPolicy.id) {
                CreepMemory.M(Game.creeps[creep]).policyId = newPolicy.id
            }
        }
    },

    sendOrderToQueue : function(room, cRace, energy, policyId, priority) {
        const data = {
            body: race.body(cRace, energy),
            name: cRace + "_" + energy.toString(),
        };
        const queue = flag.getSpawnQueue(room.name);
        return queue.addSpawn(
            data,
            priority,
            policyId,
            room.controller.level < 6 ? cRace + "_idle" : gc.STATE_FIND_BOOST,
        );
    },

    buildSourceContainer : function (obj) {
        //console.log("buildSourceContainer objid",obj.id,"obj",JSON.stringify(obj));
        const fRoom = new FlagRoom(obj.room.name);
        const cPos = fRoom.getHarvestContainerPos(obj.id);
        if (state.findContainerOrConstructionAt(gf.roomPosFromPos(cPos))) {
            return;
        }
        const result = gf.roomPosFromPos(cPos).createConstructionSite(STRUCTURE_CONTAINER);
        if (result !== OK) {
            console.log("buildSourceContainer fatal error");
            gf.fatalError("construction failed " + result.toString(),"pos", JSON.stringify(spots[0].pos));
        }
    },

    areSourceContainersFinished : function (room) {
        const fRoom = new FlagRoom(room.name);
        for (let sourceId in fRoom.sources) {
            const cPos = fRoom.getSourceContainerPos(sourceId);
            if (!cPos) {
                return false;
            }
            const container = state.findContainerAt(gf.roomPosFromPos(cPos));
            if (!container) {
                return false;
            }
        }
        return true;
    },

    buildStructuresLooseSpiral : function (room, strucType, numNeeded, skip) {
        //console.log("buildStructuresLooseSpiral room", room.name, "strucType",strucType,"numNeeded", numNeeded);
        const sources = room.find(FIND_SOURCES);
        const spawns  = room.find(FIND_MY_SPAWNS);

        let keyPts = [];
        for (let i in sources) {
            keyPts.push(sources[i].pos)
        }
        let avoid = keyPts;
        for (let i in spawns) {
            keyPts.push(spawns[i].pos)
        }
        keyPts.push(room.controller.pos);
        for ( let delta of gc.TWO_MOVES) {
            keyPts.push({
                x:room.controller.pos.x+delta.x,
                y:room.controller.pos.y+delta.y
            })
        }
        let start = construction.centreMass(keyPts);
        start = construction.closestNonWall(gf.roomPosFromPos(start, room.name));
        const structs = room.find(FIND_MY_STRUCTURES);
        for (let i in structs) {
            avoid.push(structs[i].pos)
        }
        const terrain = room.getTerrain();
        const positions = construction.looseSpiral(start, numNeeded + skip, avoid, terrain,1);
        //console.log("buildStructuresLooseSpiral positions",JSON.stringify(positions));
        for ( let i = skip; i < positions.length ; i++ ) {
            const result = room.createConstructionSite(positions[i].x, positions[i].y, strucType);
            if (result !== OK) {
            }
        }
    },
};

module.exports = policy;



























