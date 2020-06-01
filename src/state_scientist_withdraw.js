/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const FlagOwnedRoom = require("flag_owned_room");
const lr = require("./lab_reactions");

function StateScientistWithdraw (creep) {
    this.type = gc.STATE_SCIENTIST_WITHDRAW;
    this.creep = creep;
    this.m = this.creep.memory
}

StateScientistWithdraw.prototype.enact = function () {
    if (this.creep.store.getUsedCapacity() > 0) {
        state.switchTo(this.creep, this.creep.m, gc.STATE_SCIENTIST_TRANSFER);
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

    let withdrawResources = [];

    for (let lab of labs) {
        const lFlag = Game.flags[lab.id];
        const flagResource = lr.resource(lFlag.color, lFlag.secondaryColor);
        if (flagResource && lab.mineralType && lab.mineralType !== flagResource) {
            const ok = this.creep.withdraw(lab, lab.mineralType);
            if  (ok) {
                return state.switchTo(this.creep, this.creep.memory, state.STATE_SCIENTIST_TRANSFER);
            } else {
                console.log(this.creep.name,"mineral", lab.mineralType,"lab", JSON.stringify(lab));
                gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
            }
        }
        if (lab.store.getUsedCapacity(lab.mineralType) <
            lab.store.getCapacity(lab.mineralType)*gc.LAB_REFILL_THRESHOLD) {
            withdrawResources.push({
                resource: lab.mineralType,
                amount: lab.store.getCapacity(lab.mineralType) - lab.store.getUsedCapacity(lab.mineralType)
            })
        }
    }

    const link = state.getObjAtPos(gf.roomPosFromPos(foRoom.plan.link[0], room.name), STRUCTURE_LINK);
    if (link) {
        if (gf.loadFromFlag(link) && link.store[RESOURCE_ENERGY] > 0) {
            const ok = this.creep.withdraw(link, RESOURCE_ENERGY);
            if  (ok) {
                return state.switchTo(this.creep, this.creep.memory, state.STATE_SCIENTIST_TRANSFER);
            } else {
                console.log(this.creep.name, "link", JSON.stringify(link));
                gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
            }
        }
    }

    if (room.terminal) {
        const tFlag = Game.flags[room.terminal.id];
        const flagResource = lr.resource(tFlag.color, tFlag.secondaryColor);
        if (flagResource) {
            withdrawResources.push({
                resource: flagResource,
                amount: room.terminal.store.getFreeCapacity(withdrawResource)
            });
        }
    }

    for (let withdrawal of withdrawResources) {
        if (room.terminal && room.terminal.store[withdrawal.resource] > 0) {
            const ok = this.creep.withdraw(room.terminal, withdrawal.resource, withdrawal.amount);
            if (ok) {
                return state.switchTo(this.creep, this.creep.memory, state.STATE_SCIENTIST_TRANSFER);
            } else {
                console.log(this.creep.name, "terminal", JSON.stringify(room.terminal));
                gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
            }
        }
        if (room.storage && room.storage.store[withdrawal.resource] > 0) {
            const ok = this.creep.withdraw(room.storage, withdrawal.resource, withdrawal.amount);
            if (ok) {
                return state.switchTo(this.creep, this.creep.memory, state.STATE_SCIENTIST_TRANSFER);
            } else {
                console.log(this.creep.name, "storage", JSON.stringify(room.storage));
                gf.fatalError("STATE_SCIENTIST_WITHDRAW can't withdraw", ok.toString())
            }
        }
    }

};

module.exports = StateScientistWithdraw;















