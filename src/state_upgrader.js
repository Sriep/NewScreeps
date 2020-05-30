/**
 * @fileOverview screeps
 * Created by piers on 29/05/2020
 * @author Piers Shepperson
 */
const state = require("state");
const gc = require("gc");

const stateUpgrader = {
    findFreeUpgraderPost: function(room) { // done
        const upgraderPosts = state.getControllerPosts(room.controller.id);
        let lowestUserCount = 9999;
        let bestPost;
        for ( let i = 0; i < upgraderPosts.length ; i++ ) {
            let users = 0;
            let freePost = undefined;
            for (let post of upgraderPosts[i].posts) {
                //console.log("findFreeUpgraderPost post", JSON.stringify(post));
                if (this.isUpgraderPostFree(post, room.name)) {
                    if (!freePost) {
                        freePost = post;
                    }
                    //console.log("post is free", JSON.stringify(freePost));
                } else {
                    users++;
                    //console.log("findFreeUpgraderPost post is not free", users);
                }
            }
            if (users < lowestUserCount && users < upgraderPosts[i].posts.length) {
                lowestUserCount = users;
                bestPost = freePost;
                //console.log("found lowestUserCount",lowestUserCount,"bestPost",JSON.stringify(freePost));
            }
        }
        //console.log("findFreeUpgraderPost bestSoFar", lowestUserCount, "returning bestPost", JSON.stringify(bestPost));
        return bestPost;
    },

    isUpgraderPostFree: function (pos, roomName) { // done
        for (let j in Game.creeps) {
            if (this.isUpgradingHarvester(Game.creeps[j])) {
                if (Game.creeps[j].memory.targetPos.x === pos.x
                    && Game.creeps[j].memory.targetPos.y === pos.y
                    && Game.creeps[j].room.name === roomName) {
                    return false;
                }
            }
        }
        return true;
    },

    isUpgradingHarvester: function(creep) { // done
        return  (creep.memory.state === gc.STATE_UPGRADER_UPGRADE
            || creep.memory.state === gc.STATE_UPGRADER_WITHDRAW
            || ( creep.memory.state === gc.STATE_MOVE_POS
                && creep.memory.next_state === gc.STATE_UPGRADER_UPGRADE))
    },

    findUpgradeContainerNear : function (creep) {
        const range = 1;
        const structs = creep.room.lookForAtArea(
            LOOK_STRUCTURES,
            creep.pos.y-range,
            creep.pos.x-range,
            creep.pos.y+range,
            creep.pos.x+range,
            true,
        );
        //console.log("findUpgradeContainerNear stucts length", structs.length,"structs", structs)
        for (let struct of structs) {
            //console.log("findUpgradeContainerNear stuct type", struct.structureType, "struct", JSON.stringify(struct));
            if (struct.structure.structureType === STRUCTURE_CONTAINER) {
                return struct.structure;
            }
        }
        return undefined;
    },

};

module.exports = stateUpgrader;
