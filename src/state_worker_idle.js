/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
// const gf = require("gf");
const gc = require("gc");
const state = require("state");
const policy = require("policy");
const economy = require("economy");
const gf = require("gf");
const FlagRoom = require("flag_room");
const StateCreep = require("./state_creep");
const CreepMemory = require("./creep_memory");
//const _ = require("lodash");

class StateWorkerIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name,"STATE_WORKER_IDLE");
        const room = Game.rooms[this.home];
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            this.switchTo(this.memory, gc.STATE_WORKER_FULL_IDLE);
        }

        if (room.controller.level === 1 && room.controller.my) {
            const sourceInfo = this.findSourceRcl1();
            if (sourceInfo) {
                this.targetId = sourceInfo.id;
                return this.switchToMovePos(
                    sourceInfo.pos,
                    gc.RANGE_HARVEST,
                    gc.STATE_WORKER_HARVEST,
                );
            }
        }

        if (economy.constructionRepairLeft(room, false) > 0) {
            return this.enactOld();
        }

        const colony = this.findNewRoom();
        if (colony) {
            return this.switchMoveToRoom(
                colony,
                gc.STATE_WORKER_IDLE,
            );
        }
        return this.enactOld();
    };

    findNewRoom() {
        const governor = policy.getGouvernerPolicy(this.home);
        let colonies = governor.m.colonies;
        for (let i = 1 ; i < colonies.length ; i++) {
            if (Game.rooms[colonies[i].name]) {
                if (economy.constructionRepairLeft(Game.rooms[colonies[i].name], false)>0) {
                    return colonies[i].name;
                }
            }
        }
        return false;
    };

    enactOld() {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            return this.switchTo( gc.STATE_WORKER_FULL_IDLE);
        }

        const drop = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: { structureType: FIND_DROPPED_RESOURCES }
        });
        if (drop) {
            return this.switchToMovePos(
                drop.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_WORKER_PICKUP,
            );
        }

        const container = this.findCollectContainer(this.creep.room);
        //console.log(this.creep.name, "STATE_WORKER_IDLE container", container);
        if (container) {
            this.targetId = container.id;
            //console.log(this.creep.name,"move to container", container.id, "pos", container.pos);
            return this.switchToMovePos(
                container.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_WORKER_WITHDRAW,
            );
        }

        const sourcePos = this.findTargetSourcePos();
        //console.log(this.creep.name, "STATE_WORKER_IDLE findTargetSourcePos", JSON.stringify(post));
        if (sourcePos) {
            this.targetId = sourcePos.id;
            return this.switchToMovePos(
                sourcePos.pos,
                gc.RANGE_POST,
                gc.STATE_WORKER_HARVEST,
            );
        }

        const colony = this.findNewRoom();
        //console.log(this.creep.name, "STATE_WORKER_IDLE find new room colony", JSON.stringify(colony));
        if (colony) {
            return this.switchMoveToRoom(
                colony,
                gc.STATE_WORKER_IDLE,
            );
        }
    };

    findSourceRcl1() {
        const room = this.creep.room;
        let sources = room.find(FIND_SOURCES);
        if (sources.length === 2 && room.controller.level === 1) {
            const path0 = room.findPath(sources[0].pos, room.controller.pos);
            const path1 = room.findPath(sources[1].pos, room.controller.pos);
            if (path0.length > path1.length) {
                return { pos: sources[1].pos, id: sources[1].id };
            } else {
                return { pos: sources[0].pos, id: sources[0].id };
            }
        }
    };

    findTargetSourcePos() {
        const room = this.creep.room;
        let sources = room.find(FIND_SOURCES);
        if (sources.length === 0)  {
            return undefined;
        }

        const sourceId = state.atHarvestingPost(this.creep.pos);
        if (sourceId) {
            return { pos: this.creep.pos, id: sourceId };
        }

        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        for (let source of sources)  {
            const fRoom = new FlagRoom(room.name);
            const posts = fRoom.getSourcePosts(source.id);

            for (let post of posts) {
                const postCreeps = _.filter(Game.creeps, function (c) {
                    return CreepMemory.M(c).targetPos && CreepMemory.M(c).targetPos.x === post.x
                        && CreepMemory.M(c).targetPos.y === post.y
                        && CreepMemory.M(c).targetPos.roomName === post.roomName
                });
                if (postCreeps.length === 0) {
                    return { pos: post, id: source.id };
                }
            }
        }
        return undefined;
    };

    findCollectContainer(room) {
        const containerPoses = this.getHarvestContainersPos(room);
        //console.log("findCollectContainer containerPoses", JSON.stringify(containerPoses))
        let containers = [];
        for (let cPos of containerPoses) {
            const container = state.findContainerAt(gf.roomPosFromPos(cPos));
            if (container) {
                containers.push(container);
            }
        }
        //console.log("findCollectContainer containers", JSON.stringify(containers));
        if (containers.length === 0) {
            return undefined;
        }
        containers = containers.sort( (c1,c2) => {
            return c2.store.getUsedCapacity() - c1.store.getUsedCapacity()
        });
        if (containers[0].store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            return containers[0];
        }
    };

    getHarvestContainersPos(room) {
        const fRoom = new FlagRoom(room.name);
        const containersPos = [];
        for (let sourceId in fRoom.sources) {
            const cPos = fRoom.getSourceContainerPos(sourceId);
            if (cPos) {
                containersPos.push(gf.roomPosFromPos(cPos));
            }
        }
        return containersPos;
    };
}



module.exports = StateWorkerIdle;

























