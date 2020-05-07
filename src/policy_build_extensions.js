/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const policy = require("policy");

// constructor
function Policy  (data) {
    this.type = gc.POLICY_BUILD_EXTENSIONS;
    this.id = data.id;
    this.parentId = data.parentId;
}

// runs first time policy is created only
Policy.prototype.initilise = function () {
    return true;
}

// runs once every tick
Policy.prototype.enact = function () {
}

// runs once every tick before enact
// return anything without a type field to delete the policy
// return a valid policy to replace this policy with that
// return this to change policy to itself, ie no change.
Policy.prototype.draftReplacment = function() {
    return this
}

module.exports = Policy;