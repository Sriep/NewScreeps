/**
 * @fileOverview screeps
 * Created by piers on 29/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const FlagRoom = require("flag_room");

const stateUpgrader = {
    findFreeUpgraderPost: function(room) { // done
        const fRoom = new FlagRoom(room.name);
        const upgraderPosts = fRoom.getUpgradePosts();
        for ( let i = 0 ; i < upgraderPosts.length; i++ ) {
            const index = i % 2 === 0 ? i/2 : upgraderPosts.length - (i+1)/2;
            if (this.isUpgraderPostFree(upgraderPosts[index], room.name)) {
                return upgraderPosts[index]
            }
        }
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
