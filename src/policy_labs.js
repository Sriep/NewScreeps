/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

//const gf = require("gf");
const gc = require("gc");
//const policy = require("policy");

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
};

PolicyLabs.prototype.draftReplacment = function() {
    return this
};

PolicyLabs.prototype.assesBoosts = function() {
    const totals = this.countResources();
    const products = {};
    for (let reagent1 of totals) {
        if (REACTIONS[reagent1]) {
            for (let reagent2 of totals) {
                if (REACTIONS[reagent1][reagent2]) {
                    products.push({
                        [REACTIONS[reagent1][reagent2]] : {
                            reagent1:  reagent1,
                            reagent2:  reagent2,}
                    })
                }
            }
        }
    }
    let productCount = Object.keys(products).length;
    if (productCount === 0) {
        return products
    }
    for (let reagent1 in products) {
        if (REACTIONS[reagent1]) {
            for (let reagent2 of totals) {
                if (REACTIONS[reagent1][reagent2]) {
                    products.push({
                        reagent1:  reagent1,
                        reagent2:  reagent2,
                        result: REACTIONS[reagent1][reagent2]
                    })
                }
            }
            for (let reagent2 in products) {
                if (REACTIONS[reagent1][reagent2]) {
                    products.push({
                        reagent1:  reagent1,
                        reagent2:  reagent2,
                        result: REACTIONS[reagent1][reagent2]
                    })
                }
            }
        }
    }


};

PolicyLabs.prototype.countResources = function() {
    const totalStore = {};
    const structures = Game.rooms[this.home].find(FIND_MY_STRUCTURES, { filter: s => {
            return s.structureType === STRUCTURE_LAB
                || s.structureType === STRUCTURE_STORAGE
                || s.structureType === STRUCTURE_TERMINAL
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
    return totalStore;
};


module.exports = PolicyLabs;





























