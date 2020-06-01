/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const C = require("./Constants");
const gc = require("./gc");
const gf = require("./gf");
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
    const products = gf.assesProducts(totals, labPower);
    console.log("POLICY_LABS products", JSON.stringify(products));
    for (let boost of this.prioiritisedBoosts) {
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

PolicyLabs.prototype.prioiritisedBoosts =  [
    // tier 4
    C.RESOURCE_GHODIUM,
    C.RESOURCE_GHODIUM_HYDRIDE,
    //C.RESOURCE_GHODIUM_OXIDE,
    C.RESOURCE_GHODIUM_ACID,
    //C.RESOURCE_GHODIUM_ALKALIDE,
    C.RESOURCE_CATALYZED_GHODIUM_ACID,
    //C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE,

    // tier 3
    //C.RESOURCE_CATALYZED_UTRIUM_ACID,
    C.RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
    C.RESOURCE_CATALYZED_KEANIUM_ACID,
    //C.RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
    C.RESOURCE_CATALYZED_LEMERGIUM_ACID,
    //C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
    //C.RESOURCE_CATALYZED_ZYNTHIUM_ACID,
    C.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,

    // tier 2
    //C.RESOURCE_UTRIUM_ACID,
    C.RESOURCE_UTRIUM_ALKALIDE,
    C.RESOURCE_KEANIUM_ACID,
    //C.RESOURCE_KEANIUM_ALKALIDE,
    C.RESOURCE_LEMERGIUM_ACID,
    //C.RESOURCE_LEMERGIUM_ALKALIDE,
    //C.RESOURCE_ZYNTHIUM_ACID,
    C.RESOURCE_ZYNTHIUM_ALKALIDE,

    // tier 1
    //C.RESOURCE_UTRIUM_HYDRIDE,
    C.RESOURCE_UTRIUM_OXIDE,
    C.RESOURCE_KEANIUM_HYDRIDE,
    //C.RESOURCE_KEANIUM_OXIDE,
    C.RESOURCE_LEMERGIUM_HYDRIDE,
    //C.RESOURCE_LEMERGIUM_OXIDE,
    //C.RESOURCE_ZYNTHIUM_HYDRIDE,
    C.RESOURCE_ZYNTHIUM_OXIDE,

    // tier 0
    C.RESOURCE_HYDROXIDE,
    C.RESOURCE_ZYNTHIUM_KEANITE,
    C.RESOURCE_UTRIUM_LEMERGITE,
 ];



























