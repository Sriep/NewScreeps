/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */
//const gf = require("gf");
const gc = require("gc");
const statePorter = require("state_porter");
const flag = require("flag");
const StateCreep = require("./state_creep");

class StatePorterFullIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name,"STATE_PORTER_FULL_IDLE");
        if (this.creep.store.getUsedCapacity() === 0) {
            return this.switchTo( gc.STATE_PORTER_IDLE);
        }

        if (this.creep.room.name !== this.home) {
            if (this.pathName && this.pathId) {
                console.log("STATE_PORTER_FULL_IDLE pathId",this.pathId,"pathName",this.pathName);
                const obj = Game.getObjectById(this.pathId);
                console.log("STATE_PORTER_FULL_IDLE obj", obj);
                if (obj && obj.pos.getRangeTo(this.creep.pos) < 5) {
                    const pathName = this.pathName;
                    const pathId = this.pathId;
                    const fRoom = flag.getRoom(this.creep.pos.roomName);
                    //const fRoom = new FlagRoom(info.pos.home);
                    const path = fRoom.getSPath(this.home, pathId, pathName, true);
                    return this.switchToMoveToPath(
                        path,
                        new RoomPosition(25,25, this.home),
                        gc.RANGE_MOVE_TO_ROOM,
                        gc.STATE_PORTER_FULL_IDLE,
                    );
                }
            }
            return this.switchMoveToRoom(
                this.home,
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

    transportEnergy() {
        const nextDelivery = statePorter.findNextEnergyContainer(this.creep);
        //console.log("STATE_PORTER_FULL_IDLE nextDelivery",JSON.stringify(nextDelivery));
        if (nextDelivery) {
            this.targetId = nextDelivery.id;
            return this.switchToMovePos(
                nextDelivery.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_TRANSFER
            );
        }

        const container = statePorter.findUpgradeContainerToFill(Game.rooms[this.home]);
        //console.log("STATE_PORTER_FULL_IDLE container",JSON.stringify(container));
        if (container) {
            this.targetId = container.id;
            return this.switchToMovePos(
                container.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_TRANSFER
            );
        }

        const nextEnergyStorage = statePorter.findNextEnergyStorage(this.creep);
        //console.log("STATE_PORTER_FULL_IDLE nextEnergyStorage",JSON.stringify(nextEnergyStorage));
        if (nextEnergyStorage) {
            this.targetId = nextEnergyStorage.id;
            return this.switchToMovePos(
                nextEnergyStorage.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_TRANSFER
            );
        }

        if (this.creep.store.getFreeCapacity() > 0) {
            return this.switchTo( gc.STATE_PORTER_IDLE);
        }
        //console.log(this.creep.name, "StatePorterFullIdle fall thought");
    };

    transportMineral(resource) {
        const nextMineralStorage = this.findNextMineralStorage(resource);
        //console.log("STATE_PORTER_FULL_IDLE nextEnergyStorage",JSON.stringify(nextEnergyStorage));
        if (nextMineralStorage) {
            this.targetId = nextMineralStorage.id;
            return this.switchToMovePos(
                nextMineralStorage.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_PORTER_TRANSFER
            );
        }
        this.creep.drop(resource)
    };

    mainResource(store) {
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

    findNextMineralStorage() {
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
}

module.exports = StatePorterFullIdle;















































