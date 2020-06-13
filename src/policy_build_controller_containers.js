/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
const FlagRoom = require("flag_room");
const PolicyBase = require("policy_base");

class PolicyBuildControllerContainers extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_BUILD_CONTROLLER_CONTAINERS;
    }

    enact() {
        // console.log("POLICY_BUILD_CONTROLLER_CONTAINERS enact");
        if (Game.time % gc.BUILD_CHECK_RATE !== 0) {
            return;
        }
        this.setContainerSites();
    };

    setContainerSites() {
        const fRoom = new FlagRoom(this.home);
        const posts = fRoom.upgradeContainerPos;
        //console.log("setContainerSites posts", JSON.stringify(posts));
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
        const posts = fRoom.upgradeContainerPos;
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

    draftReplacement() {
        const room = Game.rooms[this.home];
        return this.areControllerContainerFinished(room) ? false : this;
    };
}

module.exports = PolicyBuildControllerContainers;





































