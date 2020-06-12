/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const C = require("./Constants");
const race = require("race");
const CreepMemory = require("./creep_memory");

// constructor
class PolicyForeignOffice   {
    constructor (id, data) {
        this.type = gc.POLICY_FOREIGN_OFFICE;
        this.id = id;
        this.m = data.m;
        this.insurgents = [];
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.m.insurgencies = {};
        Memory.policyRates[this.id] = gc.FOREIGN_OFFICE_RATE;
        return true;
    };

    enact() {
        this.checkInsurgencies();
        this.checkPatrols();
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
                this.insurgents[roomName] = insurgents;
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
        const patrols = _.filter(Game.creeps, c => {
            return CreepMemory.M(c).state === gc.STATE_PATROL_COLONIES
        })

    };

    checkPatrols() {
        const patrols = _.filter(Game.creeps, c => {
            return CreepMemory.M(c).state === gc.STATE_PATROL_COLONIES
        })

    };

    draftReplacment() {
        return this
    };
}



module.exports = PolicyForeignOffice;






























