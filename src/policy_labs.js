/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const C = require("./Constants");
const gc = require("./gc");
const lr = require("./lab_reactions");
const FlagOwnedRoom = require("./flag_owned_room");

// constructor
function PolicyLabs  (id, data) {
    this.type = gc.POLICY_LABS;
    this.id = id;
    this.home = data.home;
    this.m = data.m;
    this.parentId = data.parentId;
}

// runs first time policy is created only
PolicyLabs.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
};

// runs once every tick
PolicyLabs.prototype.enact = function () {
    const labs = Game.rooms[this.home].find(C.FIND_MY_STRUCTURES,
        { filter: s => { return s.structureType === C.STRUCTURE_LAB }
        }
    );
    const totals = this.countResources();
    const fRoom = new FlagOwnedRoom(this.hame);
    const labPower = Math.min(labs.length, 2*fRoom.flagLabs.m.plan["base_labs"]+1);
    const products = lr.assesProducts(totals, labPower);
    console.log("POLICY_LABS products", JSON.stringify(products));
    for (let boost of lr.prioiritisedBoosts) {
        if (boost in products) {
            fRoom.flagLabs(boost, totals)
        }
    }
};

PolicyLabs.prototype.draftReplacment = function() {
    return this
};

PolicyLabs.prototype.countResources = function() {
    const totalStore = {};
    const structures = Game.rooms[this.home].find(C.FIND_MY_STRUCTURES,
        { filter: s => {
            return s.structureType === C.STRUCTURE_LAB
                || s.structureType === C.STRUCTURE_STORAGE
                || s.structureType === C.STRUCTURE_TERMINAL
        }
    });
    for( let structure of structures) {
        for (let resource in structure.store) {
            if (totalStore[resource]) {
                totalStore[resource] += structure.store[resource]
            } else {
                totalStore[resource] = structure.store[resource];
            }
        }
    }
    for (let r in totalStore) {
        if (totalStore[r] < C.LAB_REACTION_AMOUNT) {
            delete totalStore[r];
        }
    }
    return totalStore;
};

module.exports = PolicyLabs;





























