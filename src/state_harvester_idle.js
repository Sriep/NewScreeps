/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const policy = require("policy");
const race = require("race");
const FlagRoom = require("flag_room");
const StateCreep = require("./state_creep");
const CreepMemory = require("./creep_memory");

class StateHarvesterIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        console.log(this.creep.name, "STATE_HARVESTER_IDLE");
        const colonies =  policy.getGouvernerPolicy(this.home).getColonies();
        const nextPost = this.nextFreeHarvesterPost(colonies);
        //console.log(this.creep.name, "STATE_HARVESTER_IDLE nextPost", JSON.stringify(nextPost));
        if (nextPost) {
            this.targetId = nextPost.id;
            if (nextPost.pos.roomName !== this.home  && this.creep.pos.roomName === this.home) {
                //console.log("STATE_HARVESTER_IDLE nextPost next room", JSON.stringify(nextPost));
                const fRoom = new FlagRoom(nextPost.pos.roomName);
                const path = fRoom.getSPath(this.home, nextPost.id, fRoom.PathTo.Spawn, true);
                //console.log(this.creep.name,"STATE_HARVESTER_IDLE path", path);
                return this.switchToMoveToPath(
                    path,
                    nextPost.pos,
                    gc.RANGE_POST,
                    gc.STATE_HARVESTER_HARVEST,
                )
            }
            this.switchToMovePos(
                nextPost.pos,
                gc.RANGE_POST,
                gc.STATE_HARVESTER_HARVEST,
            );
        }
    };

    nextFreeHarvesterPost(colonies) {
        let harvesters = _.filter(Game.creeps, c => {
            const m = CreepMemory.M(c);
            return  m.targetId && race.getRace(c) === gc.RACE_HARVESTER
        });
        //console.log("nextFreeHarvesterPost harvesters length", harvesters.length, "colonies", JSON.stringify(colonies));
        for (let colony of colonies) {
            const colonyInfo = new FlagRoom(colony.name);
            //console.log("nextFreeHarvesterPost colony", JSON.stringify(colony));
            for (let sourceId in colonyInfo.getSources()) {
                if (harvesters.filter(h => {
                    return CreepMemory.M(h).targetId === sourceId
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
                            id: colonyInfo.getMineral().id,
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
            const m = CreepMemory.M(harvester);
            const colony = new FlagRoom(m.targetPos.roomName);
            const posts = colony.getSourcePosts(m.targetId);
            console.log("nextFreeHarvesterPost harvester", harvester.name,"posts", JSON.stringify(posts));
            const post = this.findFreePostIfPossible(harvesters, posts);
            if (post) {
                console.log("nextFreeHarvesterPost found post", harvester.name,"post", JSON.stringify(post));
                return {
                    //pos: gf.roomPosFromPos(post, colony.name),
                    pos: { "x":post.x, "y":post.y, "roomName":colony.name },
                    id: m.targetId,
                }
            }
        }

        console.log("nextFreeHarvesterPost fell though")
    };

    findFreePostIfPossible(creeps, posts) {
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

}

module.exports = StateHarvesterIdle;



























