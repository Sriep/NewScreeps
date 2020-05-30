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

function StatePorterIdle (creep) {
    this.type = gc.STATE_PORTER_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}


StatePorterIdle.prototype.enact = function () {
    console.log(this.creep.name,"STATE_PORTER_IDLE");
    delete this.creep.memory.targetId;
    if (this.creep.store.getUsedCapacity() > 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_FULL_IDLE);
    }

    //const room = Game.rooms[this.homeId];
    const governor = policy.getGouvernerPolicy(this.homeId);
    let colonies = governor.getColonies();
    //{"pos" : cPos, "distance" : distance, "sourceId" : sourceId}
    const info = this.nextHarvestContainer(
        colonies, race.partCount(this.creep, CARRY)*CARRY_CAPACITY
    );
    console.log(this.creep.name, "STATE_PORTER_IDLE pos", JSON.stringify(info));
    if (info.pos) {
        this.creep.memory.targetId = info.sourceId;
        console.log(this.creep.name, "STATE_PORTER_IDLE targetId",this.creep.memory.targetId);
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

    const policyId = this.creep.policyId;
    let creeps = _.filter(Game.creeps, function (c) {
        return c.memory.policyId === policyId
            && state.isHarvestingHarvester(c)
    });
    if (creeps.length > 0) {
        creeps = creeps.sort( function (a,b)  {
            return b.store.getUsedCapacity(RESOURCE_ENERGY)
                - a.store.getUsedCapacity(RESOURCE_ENERGY);
        } );
        this.creep.memory.targetId = creeps[0].name;
        return state.switchToMovePos(
            this.creep,
            creeps[0].pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_RECEIVE
        )
    }

    undefined.break;
};

module.exports = StatePorterIdle;

StatePorterIdle.prototype.nextHarvestContainer = function(colonies, capacity) {
    let containersInfo = this.listHarvestContainers(colonies);
    //console.log("nextHarvestContainer containersInfo", JSON.stringify(containersInfo))
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
};

StatePorterIdle.prototype.listHarvestContainers = function (colonies) {
    let porters = _.filter(Game.creeps, c => {
        return  c.memory.targetId && race.getRace(c) === gc.RACE_PORTER
    });
    const containerInfo = [];
    for (let colony of colonies) {
        console.log("listHarvestContainers colony", JSON.stringify(colony));
        const colonyRoom = new FlagRoom(colony.name);
        console.log("listHarvestContainers memory", JSON.stringify(m));
        for (let sourceId in colonyRoom.getSources()) {
            let cPos = colonyRoom.getSourceContainerPos(sourceId);
            if (cPos) {
                cPos = gf.roomPosFromPos(cPos, colony.name);
                const container  = state.findContainerAt(cPos);
                if (container) {
                    //let distance = m.sources[sourceId].distance;
                    //if (!distance) {
                    //    distance = 15; // todo fix hack
                    //}
                    containerInfo.push({
                        "porters" : porters.filter( c => c.memory.targetId === sourceId).length,
                        "pos" : cPos,
                        "distance" : m.sources[sourceId].distance,
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
                    "porters" : porters.filter( c => c.memory.targetId === m.mineral.id).length,
                    "pos" : cPos,
                    "distance" : m.mineral.distance,
                    "id" : m.mineral.id,
                    "container" : state.findContainerAt(cPos)
                })
            }
        }
    }
    return containerInfo;
};





















