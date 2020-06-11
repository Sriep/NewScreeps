/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const construction = require("construction");

class PolicyBuildRoads   {
    constructor (id, data) {
        this.id = id;
        this.type = gc.POLICY_BUILD_ROADS;
        this.parentId = data.parentId;
        this.home = data.home;
        this.fromFind = data.fromFind;
        this.fromStruct = data.fromStruct;
        this.toFind = data.toFind;
        this.toStruct = data.toStruct;
        this.m = data;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.m.planned = false;
        this.home = Memory.policies[this.parentId].roomName;
        const room = Game.rooms[this.home];
        return !!room && !!room.controller && room.controller.my;
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

    draftReplacment() {
        const room = Game.rooms[this.home];
        return construction.roadsBuilt(room) && this.m.planned ? false : this;
    };
}

module.exports = PolicyBuildRoads;



























