/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

//const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const PolicyBase = require("policy_base");

class PolicyBuildSourceContainers extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_BUILD_SOURCE_CONTAINERS;
    }

    enact() {
        if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
            return;
        }
        const room = Game.rooms[this.home];
        const sources = room.find(FIND_SOURCES);
        for (let source of sources) {
            policy.buildSourceContainer(source);
        }
    };

    draftReplacement() {
        const room = Game.rooms[this.home];
        return policy.areSourceContainersFinished(room) ? false : this;
    };
}



module.exports = PolicyBuildSourceContainers;





































