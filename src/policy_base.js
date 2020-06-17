/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const policy = require("./policy");

class PolicyBase {
    constructor(id, data) {
        this.id = id;
        this.m = data.m;
        this.parentId = data.parentId;
        //console.log("policy base id",id, "data",JSON.stringify(data), "this", JSON.stringify(this));
    }

    get home() {
        return this.m.home;
    }

    initilise() {
        //console.log("policy base initilise","this",JSON.stringify(this));
        if (!this.m) {
            this.m = {}
        }
        if (this.parentId) {
            this.m.home = policy.getPolicy(this.parentId).home;
        }
        return true;
    };

    draftReplacement() {
        return this;
    };

}

module.exports = PolicyBase;