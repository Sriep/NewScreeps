/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
//const gf = require("gf");
const state = require("state");
const policy = require("policy");
//const budget = require("budget");

function State (creep) {
    this.creep = creep;
    this.state = gc.STATE_HARVESTER_IDLE;
    this.policyId = creep.memory.policyId;
    this.m = this.creep.memory;
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    console.log(this.creep.name, "STATE_HARVESTER_IDLE");
    const home = Game.rooms[this.homeId];

    const governor = policy.getGouvernerPolicy(this.homeId);
    const nextPost = state.nextFreeHarvesterPost(
        this.homeId,
        governor.getColonies(),
        home.energyCapacityAvailable
    );
    console.log(this.creep.name, "STATE_HARVESTER_IDLE nextPost", nextPost);
    if (nextPost) {
        console.log(this.creep.name,"STATE_HARVESTER_IDLE nextPost",JSON.stringify(nextPost));
        this.m.targetId = nextPost.sourceId;
        state.switchToMovePos(
            this.creep,
            nextPost.post,
            0,
            gc.STATE_HARVESTER_HARVEST,
        );
    }
};

module.exports = State;































