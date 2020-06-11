/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const FlagOwnedRoom = require("flag_owned_room");
const lr = require("./lab_reactions");

class StateScientistTransfer {
    constructor(creep) {
        this.type = gc.STATE_SCIENTIST_TRANSFER;
        this.creep = creep;
        this.m = this.creep.memory
    }

    enact() {
        if (this.creep.store.getUsedCapacity() === 0) {
            state.switchTo(this.creep, this.creep.m, gc.STATE_SCIENTIST_WITHDRAW);
        }
        const room = Game.rooms[this.creep.room];
        const foRoom = new FlagOwnedRoom(this.home);
        const labPos = foRoom.plan.lab.slice(0, foRoom.plan.base_labs);
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

        for (let resource in this.creep.store) {
            if (this.creep.store[resource] === 0) {
                continue
            }
            for (let lab of labs) {
                const lFlag = Game.flags[lab.id];
                if (resource === lr.resource(lFlag.color, lFlag.secondaryColor)) {
                    const ok = this.creep.transfer(lab, resource);
                    if  (ok) {
                        if (this.creep.store.getUsedCapacity() === 0) {
                            return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_WITHDRAW);
                        } else {
                            return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_TRANSFER);
                        }
                    } else {
                        console.log(this.creep.name,"mineral", resource,"lab", JSON.stringify(lab));
                        gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
                    }
                }
            }
            if (room.terminal) {
                const tFlag = Game.flags[room.terminal.id];
                if (resource === lr.resource(tFlag.color, tFlag.secondaryColor)) {
                    const ok = this.creep.transfer(room.terminal, resource);
                    if  (ok) {
                        if (this.creep.store.getUsedCapacity() === 0) {
                            return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_WITHDRAW);
                        } else {
                            return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_TRANSFER);
                        }
                    } else {
                        console.log(this.creep.name,"mineral", resource,"terminal", JSON.stringify(room.terminal));
                        gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
                    }
                }
            }
        }

        if (this.creep.store[RESOURCE_ENERGY] !== 0) {
            if (link) {
                const lFlag = Game.flags[link.id];
                if (RESOURCE_ENERGY === lr.resource(lFlag.color, lFlag.secondaryColor)) {
                    const ok = this.creep.transfer(link, RESOURCE_ENERGY);
                    if  (ok) {
                        if (this.creep.store.getUsedCapacity() === 0) {
                            return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_WITHDRAW);
                        } else {
                            return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_TRANSFER);
                        }
                    } else {
                        console.log(this.creep.name,"mineral", RESOURCE_ENERGY,"link", JSON.stringify(link));
                        gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
                    }
                }
            }
        }

        for (let resource in this.creep.store) {
            if (this.creep.store[resource] === 0) {
                continue;
            }
            if (room.storage && room.storage.store.getFreeCapacity() > 0) {
                const ok = this.creep.transfer(room.storage, resource);
                if  (ok) {
                    if (this.creep.store.getUsedCapacity() === 0) {
                        return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_WITHDRAW);
                    } else {
                        return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_TRANSFER);
                    }
                } else {
                    console.log(this.creep.name,"mineral", resource,"storage", JSON.stringify(room.storage));
                    gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
                }
            }
            if (room.terminal && room.terminal.store.getFreeCapacity() > 0) {
                const ok = this.creep.transfer(room.terminal, resource);
                if  (ok) {
                    if (this.creep.store.getUsedCapacity() === 0) {
                        return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_WITHDRAW);
                    } else {
                        return state.switchTo(this.creep, this.m, state.STATE_SCIENTIST_TRANSFER);
                    }
                } else {
                    console.log(this.creep.name,"mineral", resource,"terminal", JSON.stringify(room.terminal));
                    gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
                }
            }
            return;
        }
    };

}



module.exports = StateScientistTransfer;
































