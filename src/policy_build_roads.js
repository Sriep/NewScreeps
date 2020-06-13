/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const construction = require("construction");
const PolicyBase = require("policy_base");

class PolicyBuildRoads extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_BUILD_ROADS;
        this.fromFind = data.fromFind;
        this.fromStruct = data.fromStruct;
        this.toFind = data.toFind;
        this.toStruct = data.toStruct;
    }

    initilise() {
        super.initilise();
        this.m.planned = false;
        return true;
    };

    enact() {
        if (this.m.planned || Game.time % gc.BUILD_CHECK_RATE !== 0) {
            return;
        }
        const room = Game.rooms[this.home];
        construction.buildRoadsBetween(
            room, this.fromFind, this.fromStruct, this.toFind, this.toStruct
        );
        this.m.planned = true;
    };

    draftReplacement() {
        const room = Game.rooms[this.home];
        return construction.roadsBuilt(room) && this.m.planned ? false : this;
    };
}

module.exports = PolicyBuildRoads;



























