/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const C = require("./Constants");
const race = require("race");
const flag = require("flag");
const policy = require("policy");
const CreepMemory = require("./creep_memory");
//const _ = require("lodash");
const PolicyBase = require("policy_base");
const FlagRoom = require("flag_room");

class PolicyForeignOffice extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_FOREIGN_OFFICE;
    }

    initilise() {
        super.initilise();
        if (policy.getPoliciesByType(gc.POLICY_FOREIGN_OFFICE > 0)) {
            return false
        }
        this.m.insurgencies = {};
        this.m.colonyDef = [];
        Memory.policyRates[this.id] = gc.FOREIGN_OFFICE_RATE;
        return true;
    };

    get insurgencies() {
        return this.m.insurgencies;
    }

    get colonyDef() {
        this.m.colonyDef;
    }

    enact() {
        this.checkInsurgencies();
        this.checkPatrols();
        this.checkColonyDefence();
    };

    checkInsurgencies() {
        this.m.insurgency = [];
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (!Game.flags[roomName]) {
                continue;
            }
            if (room.find(C.FIND_HOSTILE_STRUCTURES, {
                filter: { structureType: STRUCTURE_INVADER_CORE }}).length > 0) {
                continue;
            }
            const insurgents = room.find(FIND_HOSTILE_CREEPS, {
                filter: object => {
                    return object.getActiveBodyparts(C.ATTACK) > 0
                        || object.getActiveBodyparts(C.RANGED_ATTACK) > 0;
                }
            });
            if (insurgents.length > 0) {
                this.insurgencies[roomName] = insurgents;
                this.sendInsurgentAlert(roomName, insurgents);
            }
            this.sendPatrol(roomName)
        }
    };

    sendInsurgentAlert(roomName) {
        for (let creep of _.filter(Game.creeps, c => {
            return c.room.name === roomName && race.isCivilian(c)
        })) {
            const m = CreepMemory.M(creep);
            m.previousState = m.state;
            m.previousPos = creep.pos;
            m.state = gc.STATE_DEFENSIVE_RETREAT;
        }
    };

    sendPatrol(roomName, insurgants) {
        const iStrength = this.strength(insurgants);
        let localDefense = [];
        const room = Game.rooms[roomName];
        if (room) {
            localDefense = room.find(FIND_MY_CREEPS, c => {
                return !race.isCivilian(c)
            })
        }
        const dStrength = this.strength(localDefense);
        if (iStrength > dStrength) {
            let shortfall = iStrength - dStrength;
            const patrols = _.filter(Game.creeps, c => {
                return CreepMemory.M(c).state === gc.STATE_PATROL
                            && c.pos.roomName !== roomName
            });
            patrols.sortsort( (a,b) =>  {
                return Game.map.getRoomLinearDistance(a.room.name, roomName)
                    - Game.map.getRoomLinearDistance(b.room.name, roomName);
            });
            for (let patrol of patrols) {
                this.sendPatrol(patrol);
                shortfall -= this.strength([patrol]);
                if (shortfall < 0) {
                    break;
                }
            }
            if (shortfall>0) {
                shortfall -= this.buildPatrol(shortfall)
            }
        }
    };

    buildPatrol() {
        let strength  = 0;
        const spawnRoom = FlagRoom.getNew(roomName).spawnRoom;
        if (policy.getRoomEconomyPolicy(spawnRoom).localBuildsFinished) {
            strength += this.buildSwordsman(spawnRoom);
            strength += this.buildHealer(spawnRoom);
        }
        return strength;
    }

    checkPatrols() {
        const patrols = _.filter(Game.creeps, c => {
            return CreepMemory.M(c).state === gc.STATE_PATROL
        })

    };

    strength(creeps) {
        let strength = 0;
        for (let creep of creeps) {
            strength += race.partCount(creep, C.ATTACK);
            strength += race.partCount(creep, C.ATTACK_POWER);
            strength += race.partCount(creep, C.HEAL);
        }
        return strength;
    }

    checkColonyDefence() {
        this.m.colonyDef = [];
        const colonialOffice = policy.getPolicyByType(gc.POLICY_COLONIAL_OFFICE);
        for (let colony of colonialOffice.colonies) {
            const defence = { attack:0, heal:0 };
            const room = Game.rooms[colony.name];
            if (!room) {
                this.m.colonyDef.push(defence);
            }
            for (let creep of room.find(C.FIND_MY_CREEPS, {
                filter: creep => {
                    return !race.isCivilian(creep)
                        && (CreepMemory.M.state === gc.STATE_PATROL
                        || CreepMemory.M.nextState === gc.STATE_PATROL)
                }
            })) {
                defence.attack += creep.getActiveBodyparts(C.ATTACK);
                defence.attack += creep.getActiveBodyparts(C.RANGED_ATTACK);
                defence.heal += creep.getActiveBodyparts(C.HEAL);
            }
            const numTowers = room.find(C.FIND_MY_STRUCTURES, {
                filter: s => { s.structureType === C.STRUCTURE_TOWER}
            }).length;
            defence.attack += numTowers*C.TOWER_POWER_ATTACK;
            defence.heal += numTowers*C.TOWER_POWER_HEAL;
            this.m.colonyDef.push(defence);
        }
        this.m.colonyDef.sort( (c1, c2) => {
            return c1.attack - c2.attack + c1.heal - c2.heal
        });
    }

    nextPatrolRoute() {
        return this.colonyDef[0]
    }

    // todo improve this stuff
    buildSwordsman(spawnRoom) {
        const data = {
            "body": race.body(gc.RACE_SWORDSMAN, spawnRoom.energyCapacityAvailable),
            "opts": {"memory": {}},
            "name": gc.RACE_SWORDSMAN + spawnRoom.energyCapacityAvailable.toString(),
        };
        flag.getSpawnQueue(this.home).addSpawn(
            data,
            gc.SPAWN_PRIORITY_FOREIGN,
            this.id,
            gc.STATE_SWORDSMAN_IDLE,
        );
        const bodyCounts = race.getBodyCounts(gc.RACE_SWORDSMAN, spawnRoom.energyCapacityAvailable)
        let strength = 0;
        strength += bodyCounts[C.ATTACK] ? bodyCounts[C.ATTACK] : 0;
        strength += bodyCounts[C.RANGED_ATTACK] ? bodyCounts[C.RANGED_ATTACK] : 0;
        strength += bodyCounts[C.HEAL] ? bodyCounts[C.HEAL] : 0;
        return strength;
    }

    buildHealer(spawnRoom) {
        const data = {
            "body": race.body(gc.RACE_HEALER, spawnRoom.energyCapacityAvailable),
            "opts": {"memory": {}},
            "name": gc.RACE_SWORDSMAN + spawnRoom.energyCapacityAvailable.toString(),
        };
        flag.getSpawnQueue(this.home).addSpawn(
            data,
            gc.SPAWN_PRIORITY_FOREIGN,
            this.id,
            gc.STATE_SWORDSMAN_IDLE,
        );
        const bodyCounts = race.getBodyCounts(gc.RACE_SWORDSMAN, spawnRoom.energyCapacityAvailable)
        let strength = 0;
        strength += bodyCounts[C.ATTACK] ? bodyCounts[C.ATTACK] : 0;
        strength += bodyCounts[C.RANGED_ATTACK] ? bodyCounts[C.RANGED_ATTACK] : 0;
        strength += bodyCounts[C.HEAL] ? bodyCounts[C.HEAL] : 0;
        return strength
    }

}
if (gc.USE_PROFILER && !gc.UNIT_TEST) {
    const profiler = require('screeps-profiler');
    profiler.registerClass(PolicyForeignOffice, 'PolicyForeignOffice');
}
module.exports = PolicyForeignOffice;






























