/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
//const gf = require("gf");
const gc = require("gc");
const state = require("state");
const statePorter = require("state_porter");

function StatePorterFullIdle (creep) {
    this.type = gc.STATE_PORTER_FULL_IDLE;
    this.creep = creep;
    this.policyId = creep.memory.policyId;
    this.homeId = Memory.policies[this.policyId].roomName;
}

StatePorterFullIdle.prototype.enact = function () {
    //console.log(this.creep.name,"STATE_PORTER_FULL_IDLE");
    if (this.creep.store.getUsedCapacity() === 0) {
        return state.switchTo(this.creep, this.creep.memory, gc.STATE_PORTER_IDLE);
    }

    if (this.creep.room.name !== this.homeId) {
        
        return state.switchMoveToRoom(
            this.creep,
            this.homeId,
            gc.STATE_PORTER_FULL_IDLE,
        );
    }
    const resource = this.mainResource(this.creep.store);
    if (resource === RESOURCE_ENERGY) {
        return this.transportEnergy()
    } else {
        return this.transportMineral(resource)
    }
};

StatePorterFullIdle.prototype.transportEnergy = function () {
    const nextDelivery = statePorter.findNextEnergyContainer(this.creep);
    //console.log("STATE_PORTER_FULL_IDLE nextDelivery",JSON.stringify(nextDelivery));
    if (nextDelivery) {
         this.creep.memory.targetId = nextDelivery.id;
         return state.switchToMovePos(
            this.creep,
            nextDelivery.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

    const container = statePorter.findUpgradeContainerToFill(Game.rooms[this.homeId]);
    //console.log("STATE_PORTER_FULL_IDLE container",JSON.stringify(container));
    if (container) {
        this.creep.memory.targetId = container.id;
        return state.switchToMovePos(
            this.creep,
            container.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }

    const nextEnergyStorage = statePorter.findNextEnergyStorage(this.creep);
    //console.log("STATE_PORTER_FULL_IDLE nextEnergyStorage",JSON.stringify(nextEnergyStorage));
    if (nextEnergyStorage) {
        this.creep.memory.targetId = nextEnergyStorage.id;
        return state.switchToMovePos(
            this.creep,
            nextEnergyStorage.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }
};

StatePorterFullIdle.prototype.transportMineral = function (resource) {
    const nextMineralStorage = this.findNextMineralStorage(resource);
    //console.log("STATE_PORTER_FULL_IDLE nextEnergyStorage",JSON.stringify(nextEnergyStorage));
    if (nextMineralStorage) {
        this.creep.memory.targetId = nextMineralStorage.id;
        return state.switchToMovePos(
            this.creep,
            nextMineralStorage.pos,
            gc.RANGE_TRANSFER,
            gc.STATE_PORTER_TRANSFER
        );
    }
    this.creep.drop(resource)
};

StatePorterFullIdle.prototype.mainResource = function (store) {
    if (store.getUsedCapacity() === 0) {
        return;
    }
    let bestSoFar;
    let amount = 0;
    for (let resource in store) {
        if (store[resource] > amount) {
            bestSoFar = resource;
            amount = store[resource]
        }
    }
    return bestSoFar;
};

module.exports = StatePorterFullIdle;

StatePorterFullIdle.prototype.findNextMineralStorage = function () {
    const room = this.creep.room;
    const labs = this.creep.room.find(FIND_MY_STRUCTURES, {
        filter: lab =>  {
            if (lab.structureType === STRUCTURE_LAB) {
                const lFlag = Game.flags[lab.id];
                const resource = lr.resource(lFlag.color, lFlag.secondaryColor);
                return  resource && this.creep.store[resource] > 0
                    && lab.store.getUsedCapacity(resource) <
                    lab.store.getCapacity(resource)*gc.LAB_REFILL_THRESHOLD
            } else {
                return false;
            }
        }
    });
    if (labs.length > 0) {
        return labs[0];
    }

    if (room.terminal) {
        const tFlag = Game.flags[room.terminal.id];
        if (this.creep.store[lr.resource(tFlag.color, tFlag.secondaryColor)] > 0) {
            return room.terminal
        }
    }

    if (room.storage && room.storage.store.getFreeCapacity() >= 0) {
        return room.storage
    }

    if (room.terminal && room.terminal.store.getFreeCapacity() > 0) {
        return room.terminal
    }
};















































