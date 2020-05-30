/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const gf = require("gf");
const state = require("state");
const policy = require("policy");
const race = require("race");

function StateHarvesterIdle (creep) {
    this.creep = creep;
    this.state = gc.STATE_HARVESTER_IDLE;
    this.policyId = creep.memory.policyId;
    this.m = this.creep.memory;
    this.homeId = Memory.policies[this.policyId].roomName;
}

StateHarvesterIdle.prototype.enact = function () {
    //console.log(this.creep.name, "STATE_HARVESTER_IDLE");
    //const home = Game.rooms[this.homeId];

    const governor = policy.getGouvernerPolicy(this.homeId);
    const nextPost = this.nextFreeHarvesterPost(governor.getColonies());
    console.log(this.creep.name, "STATE_HARVESTER_IDLE nextPost", JSON.stringify(nextPost));
    if (nextPost) {
        //console.log(this.creep.name,"STATE_HARVESTER_IDLE nextPost",JSON.stringify(nextPost));
        this.m.targetId = nextPost.id;
        state.switchToMovePos(
            this.creep,
            nextPost.pos,
            0,
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
        //console.log("nextFreeHarvesterPost colony", JSON.stringify(colony));
        for (let sourceId in Game.flags[colony.name].memory.sources) {
            if (harvesters.filter(h=>{return h.memory.targetId === sourceId}) === 0) {
                return {
                    pos : gf.roomPosFromPos(state.getSourcePosts(sourceId)[0], colony.name),
                    id : sourceId,
            }
        }
    }
    for (let colony of colonies) {
        const room = Game.rooms[colony.name];
        if (!room) {
            continue;
        }
        const extractors = room.find(FIND_MY_STRUCTURES, {
            filter: s=>  { return s.structureType === STRUCTURE_EXTRACTOR }
        });
        if (extractors > 0) {
            const posts = state.getMineralPosts(room.memory.mineral.id);
            if (posts) {
                return {
                    pos: gf.roomPosFromPos(posts[0], colony.name),
                    id: room.memory.mineral.id
                }
            }
        }

        }
    }

    harvesters = harvesters.sort((h1, h2) => {
        return h1.ticksToLive - h2.ticksToLive
    });    // todo factor in Game.flags[roomname?].memory.sources[harvester.memory.targetId].distance
    for (let harvester of harvesters) {
        const posts = state.getSourcePosts(harvester.memory.targetId);
        const post = this.findFreePostIfPossible(harvesters, posts);
        if (post) {
            const obj = Game.getObjectById(harvester.memory.targetId);
            return {
                pos: gf.roomPosFromPos(post, obj.room.name),
                id: harvester.memory.targetId
            }
        }
    }
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






























