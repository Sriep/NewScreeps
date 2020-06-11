/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
const FlagRoom = require("flag_room");

class PolicyBuildControllerContainers {
    constructor (id, data) {
        this.id = id;
        this.type = gc.POLICY_BUILD_CONTROLLER_CONTAINERS;
        this.parentId = data.parentId;
        this.home = data.home;
        this.m = data.m;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.home = Memory.policies[this.parentId].roomName;
        const room = Game.rooms[this.home];
        return !!room && !!room.controller && room.controller.my;
    };

    enact() {
        // console.log("POLICY_BUILD_CONTROLLER_CONTAINERS enact");
        if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
            return;
        }
        this.setContainerSites();
    };

    setContainerSites() {
        const fRoom = new FlagRoom(this.home);
        const posts = fRoom.getUpgradeContainerPos();
        console.log("setContainerSites posts", JSON.stringify(posts));
        for (let post of posts) {
            const pos = gf.roomPosFromPos(post);
            //console.log("setContainerSites pos", JSON.stringify(pos));
            if (!state.findContainerOrConstructionAt(gf.roomPosFromPos(pos))) {
                const result = pos.createConstructionSite(STRUCTURE_CONTAINER);
                if (result !== OK) {
                    gf.fatalError("POLICY_BUILD_CONTROLLER_CONTAINERS controller container construction failed " + result.toString());
                }
            }

        }
    };

    areControllerContainerFinished() {
        const fRoom = new FlagRoom(this.home);
        const posts = fRoom.getUpgradeContainerPos();
        if (!posts) {
            return false;
        }
        for (let post of posts) {
            if (!state.findContainerAt(gf.roomPosFromPos(post))) {
                return false;
            }
        }
        return true;
    };

    draftReplacment() {
        const room = Game.rooms[this.home];
        return this.areControllerContainerFinished(room) ? false : this;
    };
}

module.exports = PolicyBuildControllerContainers;





































