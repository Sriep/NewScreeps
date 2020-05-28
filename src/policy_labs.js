/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

// constructor
function Policy  (id, data) {
    this.type = gc.POLICY_LABS;
    this.id = id;
    this.home = data.home;
    this.m = data.m;
    this.parentId = data.parentId;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.home = Memory.policies[this.parentId].roomName;
};

// runs once every tick
Policy.prototype.enact = function () {
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;