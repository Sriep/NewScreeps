/**
 * @fileOverview screeps
 * Created by piers on 26/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const FlagOwnedRoom = require("flag_owned_room");
const PolicyBase = require("policy_base");

// constructor
class PolicyPlanBuilds extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_PLAN_BUILDS;
    }

    initilise() {
        super.initilise();
        this.m.finished = false;
        return true;
    };

    enact() {
        console.log("POLICY_PLAN_BUILDS enact");
        //const sources = Game.rooms[this.home].find(FIND_SOURCES);
        //if (sources.length < 2) {
        //    return;
        //}
        const fRoom = new FlagOwnedRoom(this.home);
        const spawns = Game.rooms[this.home].find(FIND_MY_SPAWNS);
        fRoom.placeCentre(gc.TILE_CENTRE,spawns.length > 0 ? spawns[0].pos : undefined);
        this.m.finished = true;
    };

    draftReplacement() {
        return this.m.finished ? false : this;
    };
}



module.exports = PolicyPlanBuilds;