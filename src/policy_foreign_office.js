/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

// constructor
function PolicyColonialOffice  (id, data) {
    this.type = gc.POLICY_FOREIGN_OFFICE;
    this.id = id;
    this.m = data.m;
    this.insurgents = [];
}

// runs first time policy is created only
PolicyColonialOffice.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.insurgencies = {};
    Memory.policyRates[this.id] = gc.FOREIGN_OFFICE_RATE;
    return true;
};

// runs once every tick
PolicyColonialOffice.prototype.enact = function () {
    this.checkInsurgencies()
};

PolicyColonialOffice.prototype.checkInsurgencies = function () {
    this.m.insurgency = [];
    for (let roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (Game.flags[roomName].keeperLairs) {
            continue
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
            this.sendInsurgentAlert(roomName);
        }
    }
};

PolicyColonialOffice.prototype.sendInsurgentAlert = function (roomName) {
    for (let creep of _.filter(Game.creeps, c => {
        return c.room.name === roomName && race.isCivilian(c)
    })) {
        creep.memory["previous_state"] = creep.memory.state;
        creep.memory["previous_pos"] = creep.pos;
        creep.memory.state = gc.STATE_DEFENSIVE_RETREAT;
    }
};

PolicyColonialOffice.prototype.draftReplacment = function() {
    return this
};

module.exports = PolicyColonialOffice;






























