/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const gc = require("gc");
const state = require("state");
const policy = require("policy");
const race = require("race");
const FlagRoom= require("flag_room");
const FlagOwnedRoom = require("flag_owned_room");
const StateCreep = require("./state_creep");

class StatePorterIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

//StatePorterIdle.prototype = state;
    enact() {
        //console.log(this.creep.name,"STATE_PORTER_IDLE", this.creep.pos);
        delete this.targetId;
        this.checkFlags();

        if (this.creep.store.getUsedCapacity() > 0) {
            return state.switchTo(this.creep, this.memory, gc.STATE_PORTER_FULL_IDLE);
        }

        const governor = policy.getGouvernerPolicy(this.home);
        let colonies = governor.getColonies();
        const info = this.nextHarvestContainer(
            colonies, race.partCount(this.creep, CARRY)*CARRY_CAPACITY
        );
        if (info && info.pos) {
            this.targetId = info.id;
            if (info.pos.roomName !== this.home && this.creep.pos.roomName === this.home) {
                const fRoom = new FlagRoom(info.pos.roomName);
                const path = fRoom.getSPath(this.home, info.id, fRoom.PathTo.Spawn, true);
                //this.setM(this.M.PathName, fRoom.PathTo.Spawn);
                this.pathName = fRoom.PathTo.Spawn;
                this.memory.pathId = info.id;
                //console.log(this.creep.name,"STATE_PORTER_IDLE path", path,"pathName",this.pathName);
                return state.switchToMoveToPath(
                    this.creep,
                    path,
                    info.pos,
                    gc.RANGE_TRANSFER,
                    gc.STATE_PORTER_WITHDRAW,
                )
            }
            return state.switchToMovePos(
                this.creep,
                info.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_WITHDRAW,
            );
        }

        // todo maybe this should go first?
        const drop = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: { structureType: FIND_DROPPED_RESOURCES }
        });
        if (drop) {
            return state.switchToMovePos(
                this.creep,
                drop.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_PICKUP,
            );
        }

        let creeps = _.filter(Game.creeps, c => {
            return c.memory.policyId === this.policyId
                && this.isHarvestingHarvester(c)
        });
        if (creeps.length > 0) {
            creeps = creeps.sort( function (a,b)  {
                return b.store.getUsedCapacity(RESOURCE_ENERGY)
                    - a.store.getUsedCapacity(RESOURCE_ENERGY);
            } );
            this.targetId = creeps[0].name;
            return state.switchToMovePos(
                this.creep,
                creeps[0].pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_RECEIVE
            )
        }
    };



    isHarvestingHarvester(creep) {
        return  race.getRace(creep) === gc.RACE_HARVESTER
            && (creep.memory.state === gc.STATE_HARVESTER_BUILD
                || creep.memory.state === gc.STATE_HARVESTER_REPAIR
                || creep.memory.state === gc.STATE_HARVESTER_TRANSFER
                || creep.memory.state === gc.STATE_HARVESTER_HARVEST
                || ( creep.memory.state === gc.STATE_MOVE_POS
                    && creep.memory.next_state === gc.STATE_HARVESTER_HARVEST))
    };

    nextHarvestContainer(colonies, capacity) {
        let containersInfo = this.listHarvestContainers(colonies);
        containersInfo = containersInfo.sort((c1, c2) =>
            c2.container.store.getUsedCapacity() - c1.container.store.getUsedCapacity()
        );

        for (let info of containersInfo) {
            if (info.container.store.getUsedCapacity() === 0) {
                break;
            }
            if (info.container.store.getUsedCapacity() > info.porters*capacity) {
                return info;
            }
        }

        let harvesters = _.filter(Game.creeps, c => {
            return  c.memory.targetId && race.getRace(c) === gc.RACE_HARVESTER
        });
        for (let info of containersInfo) {
            info["harvesters"] = harvesters.filter( c => c.memory.targetId === info.id).length
        }
        containersInfo = containersInfo.sort((c1, c2) =>
            c2.harvesters - c1.harvesters
        );
        for (let info of containersInfo) {
            if (info.harvesters === 0) {
                break;
            }
            if (info.porters === 0) {
                return info
            }
        }
        containersInfo = containersInfo.sort((c1, c2) =>
            c1.porters - c2.porters
        );
        return containersInfo[0];
    };

    listHarvestContainers(colonies) {
        let porters = _.filter(Game.creeps, c => {
            return  c.memory.targetId && race.getRace(c) === gc.RACE_PORTER
        });
        const containerInfo = [];
        for (let colony of colonies) {
            if (!Game.rooms[colony.name]) {
                continue;
            }
            //console.log("listHarvestContainers colony", JSON.stringify(colony));
            const colonyRoom = new FlagRoom(colony.name);
            //console.log("listHarvestContainers memory", JSON.stringify(colonyRoom.m));
            for (let sourceId in colonyRoom.getSources()) {
                let cPos = colonyRoom.getSourceContainerPos(sourceId);
                if (cPos) {
                    cPos = gf.roomPosFromPos(cPos, colony.name);
                    const container  = state.findContainerAt(cPos);
                    if (container) {
                        containerInfo.push({
                            "porters" : porters.filter( c => c.memory.targetId === sourceId).length,
                            "pos" : cPos,
                            "id" : sourceId,
                            "container" : state.findContainerAt(cPos)
                        })
                    }
                }
            }
            let cPos = colonyRoom.getMineralContainerPos();
            if (cPos) {
                cPos = gf.roomPosFromPos(cPos, colony.name);
                const container  = state.findContainerAt(cPos);
                if (container) {
                    containerInfo.push({
                        "porters" : porters.filter( c => c.memory.targetId === colonyRoom.m.mineral.id).length,
                        "pos" : cPos,
                        "id" : colonyRoom.m.mineral.id,
                        "container" : state.findContainerAt(cPos)
                    })
                }
            }
        }
        return containerInfo;
    };

    checkFlags() {
        if (!this.creep.room.controller.my || this.creep.room.controller.level < 6) {
            return;
        }
        const foRoom = new FlagOwnedRoom(this.home);
        const labPos = foRoom.plan.lab.slice(foRoom.plan.base_labs);
        const labs = room.find(FIND_MY_STRUCTURES, {
            filter: obj => {
                if (obj.structureType === STRUCTURE_LAB) {
                    for (let pos of labPos) {
                        if (pos.x === obj.pos.x && pos.y === obj.pos.y) {
                            return true;
                        }
                    }
                }
                return false;
            }
        });
        for (let lab of labs) {
            const lFlag = Game.flags[lab.id];
            const flagResource = lr.resource(lFlag.color, lFlag.secondaryColor);
            if (flagResource && lab.mineralType && lab.mineralType !== flagResource) {
                return state.switchToMovePos(
                    this.creep,
                    lab.pos,
                    gc.RANGE_TRANSFER,
                    gc.STATE_PORTER_TRANSFER
                )
            }
        }
    };

}

module.exports = StatePorterIdle;





















