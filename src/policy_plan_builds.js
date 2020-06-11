/**
 * @fileOverview screeps
 * Created by piers on 26/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const FlagOwnedRoom = require("flag_owned_room");
//const tile = require("tile");

// constructor
class PolicyPlanBuilds {
    constructor (id, data) {
        this.type = gc.POLICY_PLAN_BUILDS;
        this.id = id;
        this.parentId = data.parentId;
        this.home = data.home;
        this.m = data.m;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.m.finished = false;
        this.home = Memory.policies[this.parentId].roomName;
        return gc.PLANNED_BUILDS;
    };

    enact() {
        console.log("POLICY_PLAN_BUILDS enact");
        const fRoom = new FlagOwnedRoom(this.home);
        const spawns = Game.rooms[this.home].find(FIND_MY_SPAWNS);
        fRoom.placeCentre(gc.TILE_CENTRE,spawns.length > 0 ? spawns[0].pos : undefined);
        this.m.finished = true;
    };

    draftReplacment() {
        console.log("POLICY_PLAN_BUILDS draftReplacment this.m.finished",this.m.finished );
        return this.m.finished ? false : this;
    };
}



module.exports = PolicyPlanBuilds;