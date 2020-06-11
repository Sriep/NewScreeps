/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");
const stateUpgrader = require("state_upgrader");
const FlagRoom = require("flag_room");
const StateCreep = require("./state_creep");

class StateUpgraderIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        const home = Game.rooms[this.home];
        //console.log(this.creep.name, "STATE_UPGRADER_IDLE");

        const UpgradePost = stateUpgrader.findFreeUpgraderPost(home);
        //console.log("STATE_UPGRADER_IDLE found post", JSON.stringify(UpgradePost))
        if (UpgradePost) {
            return this.goUpgrade(UpgradePost);
        }
        const fRoom = new FlagRoom(this.home);
        if (this.atUpgradingPost(this.creep.pos)) {
            //console.log("STATE_UPGRADER_IDLE at UpgradingPost", JSON.stringify(this.creep.pos))
            const upgradeContainerPoses = fRoom.getUpgradePosts();
            for (let cPos of upgradeContainerPoses) {
                const upgradeContainer = state.findContainerAt(gf.roomPosFromPos(cPos));
                if (upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
                    const upgraders = policy.getCreeps(this.policyId, gc.RACE_UPGRADER);
                    for (let i in upgraders) {
                        const m = CreepMemory.M(upgraders);
                        if (m.targetPos.x === this.creep.x && m.targetPos.y === this.creep.y) {
                            m.targetPos = undefined;
                            m.state = gc.STATE_UPGRADER_IDLE;
                        }
                    }
                    this.targetId = home.controller.id;
                    this.targetPos = this.creep.pos;
                    return this.switchTo( gc.STATE_UPGRADER_UPGRADE);
                }
            }
        }
    };

    goUpgrade(post) {
        const home = Game.rooms[this.home];
        if (!post) {
            post =  stateUpgrader.findFreeUpgraderPost(home);
        }
        if (!post) {
            return;
        }
        this.targetId = home.controller.id;
        const newPos = gf.roomPosFromPos({x: post.x, y:post.y, roomName: home.name});
        return this.switchToMovePos(
             newPos,
            0,
            gc.STATE_UPGRADER_UPGRADE
        );
    };

    atUpgradingPost(pos) {
        const fRoom = new FlagRoom(pos.roomName);
        const posts = fRoom.getUpgradePosts();
        for (let i in posts) {
            if (pos.x === posts[i].x && pos.y === posts[i].y){
                return true;
            }
        }
        return false;
    };

}

module.exports = StateUpgraderIdle;































