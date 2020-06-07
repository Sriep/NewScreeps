/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");
const policy = require("policy");
const race = require("race");
const FlagRoom = require("flag_room");

function StateHarvesterIdle (creep) {
    this.creep = creep;
    this.state = gc.STATE_HARVESTER_IDLE;
    this.policyId = creep.memory.policyId;
    this.m = this.creep.memory;
    this.homeId = Memory.policies[this.policyId].roomName;
}

StateHarvesterIdle.prototype.enact = function () {
    console.log(this.creep.name, "STATE_HARVESTER_IDLE");

    const governor = policy.getGouvernerPolicy(this.homeId);
    const nextPost = this.nextFreeHarvesterPost(governor.getColonies());
    if (nextPost) {
        this.m.targetId = nextPost.id;
        state.switchToMovePos(
            this.creep,
            nextPost.pos,
            gc.RANGE_POST,
            gc.STATE_HARVESTER_HARVEST,
        );
    }
};

module.exports = StateHarvesterIdle;

StateHarvesterIdle.prototype.nextFreeHarvesterPost = function (colonies) {
    let harvesters = _.filter(Game.creeps, c => {
        return  c.memory.targetId && race.getRace(c) === gc.RACE_HARVESTER
    });
    //console.log("nextFreeHarvesterPost harvesters length", harvesters.length, "colonies", JSON.stringify(colonies));
    for (let colony of colonies) {
        const colonyInfo = new FlagRoom(colony.name);
        //console.log("nextFreeHarvesterPost colony", JSON.stringify(colony));
        for (let sourceId in colonyInfo.getSources()) {
            //const hAt = harvesters.filter(h => {
            //    return h.memory.targetId === sourceId
            //});
            //console.log("nextFreeHarvesterPost sourceId", sourceId, "number", hAt.length, "objs", JSON.stringify(hAt));
            if (harvesters.filter(h => {
                return h.memory.targetId === sourceId
            }).length === 0) {
                //console.log("nextFreeHarvesterPost", sourceId, "lengthis0", hAt.length);
                const post = colonyInfo.getSourcePosts(sourceId)[0];
                return {
                    //pos: gf.roomPosFromPos( colony.name),
                    pos: {"x": post.x, "y": post.y, "roomName": colony.name},
                    id: sourceId,
                }
            }
        }
        //console.log("looking for minerals");
        for (let colony of colonies) {
            const room = Game.rooms[colony.name];
            if (!room) {
                continue;
            }
            const extractors = room.find(FIND_MY_STRUCTURES, {
                filter: s => {
                    return s.structureType === STRUCTURE_EXTRACTOR
                }
            });
            if (extractors > 0) {
                const colonyInfo = new FlagRoom(colony.name);
                const posts = colonyInfo.getMineralPosts();
                if (posts) {
                    return {
                        //pos: gf.roomPosFromPos(posts[0], colony.name),
                        pos: {"x": posts[0].x, "y": posts[0].y, "roomName": colony.name},
                        id: colonyInfo.getMineral().id
                    }
                }
            }
        }
    }
    //console.log("looking for oldest harvester");
    harvesters = harvesters.sort((h1, h2) => {
        return h1.ticksToLive - h2.ticksToLive
    });    // todo factor in Game.flags[roomname?].memory.sources[harvester.memory.targetId].distance
    for (let harvester of harvesters) {
        const colony = new FlagRoom(harvester.memory.targetPos.roomName);
        const posts = colony.getSourcePosts(harvester.memory.targetId);
        console.log("nextFreeHarvesterPost harvester", harvester.name,"posts", JSON.stringify(posts));
        const post = this.findFreePostIfPossible(harvesters, posts);
        if (post) {
            console.log("nextFreeHarvesterPost found post", harvester.name,"post", JSON.stringify(post));
            return {
                //pos: gf.roomPosFromPos(post, colony.name),
                pos: { "x":post.x, "y":post.y, "roomName":colony.name },
                id: harvester.memory.targetId
            }
        }
    }

    console.log("nextFreeHarvesterPost fell though")
};

StateHarvesterIdle.prototype.findFreePostIfPossible = function (creeps, posts) {
    //console.log("findFreePostIfPossable creep lenght", creeps.length, "posts", JSON.stringify(posts))
    for (let post of posts) {
        let taken = false;
        for (let creep of creeps) {
            if (creep.pos.x === post.x && creep.pos.y === post.y) {
                taken = true;
                break;
            }
        }
        if (!taken) {
            return post;
        }
    }
    return false;
};






























