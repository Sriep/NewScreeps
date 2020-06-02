/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
// const gf = require("gf");
const gc = require("gc");
const state = require("state");
const policy = require("policy");
//const economy = require("economy");
const FlagRoom = require("flag_room");

function StateWorkerIdle (creep) {
    this.type = gc.STATE_WORKER_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
    this.m = creep.memory;
    // console.log("STATE_WORKER_IDLE this", JSON.stringify(this));
}

StateWorkerIdle.prototype.enact = function () {
    console.log(this.creep.name,"STATE_WORKER_IDLE");
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        state.switchTo(this.creep, this.creep.memory, gc.STATE_WORKER_FULL_IDLE);
    }

    if (this.workToDo(this.homeId)) {
        return this.enactOld();
    }
    const colony = this.findNewRoom();
    if (colony) {
        return state.switchMoveToRoom(
            this.creep,
            colony,
            gc.STATE_WORKER_IDLE,
        );
    }
    return this.enactOld();
};

StateWorkerIdle.prototype.findNewRoom = function() {
    const governor = policy.getGouvernerPolicy(this.homeId);
    let colonies = governor.m.colonies;
    //if (colonies.length === 0) {
    //    return false;
    //}
    //colonies = colonies.sort( (c1, c2)  => {
    //    return Game.map.getRoomLinearDistance(c1, this.creep.room.name)
    //        - Game.map.getRoomLinearDistance(c2, this.creep.room.name)
    //});
    for (let i = 1 ; i < colonies.length ; i++) {
        if (this.workToDo(colonies[i])) {
            return colonies[i];
        }
    }
    return false;
};

StateWorkerIdle.prototype.workToDo = function(colonyName) {
    const colony = Game.rooms[colonyName];
    if (!colony) {
        return true;
    }
    let nextConstructionSite = colony.find(FIND_MY_CONSTRUCTION_SITES);
    if (nextConstructionSite) {
        return true;
    }
    return !!colony.find(FIND_STRUCTURES, {
        filter: function(s)  {
            return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD;
        }
    });
};

StateWorkerIdle.prototype.enactOld = function () {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_WORKER_FULL_IDLE);
    }

    const drop = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: { structureType: FIND_DROPPED_RESOURCES }
    });
    if (drop) {
        return state.switchToMovePos(
            this.creep,
            drop.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_PICKUP,
        );
    }

    const container = state.findCollectContainer(this.creep.room);
    if (container &&
        container.store.getUsedCapacity(RESOURCE_ENERGY)
            > container.store.getCapacity(RESOURCE_ENERGY)//*gc.CONTAINER_EMPTY_THRESHOLD
    ) {
        this.creep.memory.targetId = container.id;
        return state.switchToMovePos(
            this.creep,
            container.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_WORKER_WITHDRAW,
        );
    }

    const post = this.workerFindTargetSourcePos();
    if (post) {
        this.creep.memory.targetId = post.id;
        return state.switchToMovePos(
            this.creep,
            post.pos,
            gc.RANGE_POST,
            gc.STATE_WORKER_HARVEST,
        );
    }

    const colony = this.findNewRoom();
    if (colony) {
        return state.switchMoveToRoom(
            this.creep,
            colony,
            gc.STATE_WORKER_IDLE,
        );
    }
};

StateWorkerIdle.prototype.workerFindTargetSourcePos = function() {
    const room = this.creep.room;
    let sources = room.find(FIND_SOURCES);
    if (sources.length === 0)  {
        return undefined;
    }

    if (sources.length === 2 && room.controller.level === 1) {
        const path0 = room.findPath(sources[0].pos, room.controller.pos);
        const path1 = room.findPath(sources[1].pos, room.controller.pos);
        if (path0.length > path1.length) {
            return { pos: sources[1].pos, id: sources[1].id };
        } else {
            return { pos: sources[0].pos, id: sources[0].id };
        }
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
                return c.memory.targetPos && c.memory.targetPos.x === post.x
                    && c.memory.targetPos.y === post.y
                    && c.memory.targetPos.roomName === post.roomName
            });
            if (postCreeps.length === 0) {
                return { pos: post, id: source.id };
            }
        }
    }
    return undefined;
};

module.exports = StateWorkerIdle;

























