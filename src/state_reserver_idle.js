/**
 * @fileOverview screeps
 * Created by piers on 20/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");

function State (creep) {
    this.type = gc.STATE_RESERVER_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.m = this.creep.memory;
    this.homeId = Memory.policies[this.policyId].roomName;
}

State.prototype.enact = function () {
    delete this.m.targetId;
    claimers = _.filter(Game.creeps, c => {
        return c.memory.policyId === policyId
            && race.getRace(creep) === gc.RACE_CLAIMER
            && c.memory.targetId
    });
    const colonies = policy.getGouvernerPolicy(this.homeId).getColonies();
    let colonyIds = _.map(colonies, colony => {
        return { "name" : colony.name, "id": getRoomFlag(colony.name).memory.controller.id, "count" : 0};
    });
    console.log("gc.STATE_RESERVER_IDLE", JSON.stringify(claimerActivity));
    for ( let i = claimers.length-1 ; i >= 0 ; i-- ) {
        let found = false;
        for (let colony of colonyIds) {
            if (claimers[i].memory.targetId === colony.id) {
                colony["count"] += claimers[i].ticksToLive;
            }
            if (!found) {
                delete claimers[i].memory.targetId;
                claimers[i].state = gc.STATE_RESERVER_IDLE;
            }
            claimers.pop();
        }
    }
    colonyIds = colonyIds.sort(  (a,b) =>  {
        return a.count - b.count;
    });
    this.m.tartetId = colonyIds[0]["id"];
    return state.switchToMoveFlag(
        this.creep,
        Game.flags[colonyIds[0]["id"]],
        3,
        gc.STATE_RESERVER_RESERVE,
    );
};

module.exports = State;




















