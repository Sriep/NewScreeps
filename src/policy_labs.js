/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const C = require("./Constants");
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
    const products = this.assesBoosts(3);
    console.log("POLICY_LABS products", JSON.stringify(products));
};

PolicyLabs.prototype.draftReplacment = function() {
    return this
};

PolicyLabs.prototype.assesBoosts = function(numLabs) {
    const totals = this.countResources();
    let products = {};
    for (let reagent1 of totals) {
        if (C.REACTIONS[reagent1]) {
            for (let reagent2 of totals) {
                if (C.REACTIONS[reagent1][reagent2]) {
                    products[C.REACTIONS[reagent1][reagent2]] = {
                            reagent1:  reagent1,
                            reagent2:  reagent2,
                    }
                }
            }
        }
    }
    let productCount = Object.keys(products).length;
    if (numLabs < 5 || productCount === 0) {
        return products
    }

    products = this.findProducts(totals, products);
    const productCount2 = Object.keys(products).length;
    if (numLabs < 7 || productCount === newProductCount) {
        return products
    }

    products = this.findProducts(totals, products);
    const productCount3 = Object.keys(products).length;
    if (numLabs < 9 || productCount2 === productCount3) {
        return products
    }

    products = this.findProducts(totals, products);
    return products
};

PolicyLabs.prototype.findProducts = function(totals, products) {
    for (let reagent1 in products) {
        if (C.REACTIONS[reagent1]) {
            for (let reagent2 of totals) {
                if (C.REACTIONS[reagent1][reagent2]) {
                    products[C.REACTIONS[reagent1][reagent2]] = {
                        reagent1:  reagent1,
                        reagent2:  reagent2,
                    }
                }
            }
            for (let reagent2 in products) {
                if (C.REACTIONS[reagent1][reagent2]) {
                    products[C.REACTIONS[reagent1][reagent2]] = {
                        reagent1:  reagent1,
                        reagent2:  reagent2,
                    }
                }
            }
        }
    }
    return products;
};

PolicyLabs.prototype.countResources = function() {
    const totalStore = {};
    const structures = Game.rooms[this.home].find(C.FIND_MY_STRUCTURES, { filter: s => {
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
    return totalStore;
};


module.exports = PolicyLabs;





























