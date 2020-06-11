/**
 * @fileOverview screeps
 * Created by piers on 17/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gc = require("gc");

class StateLabAuto {
    constructor(structure) {
        this.type = gc.STATE_LAB_AUTO;
        this.lab = structure;
    }

    enact() {
        if (this.lab.cooldown > 0) {
            return;
        }
        const store = this.lab.store;
        if (store[C.RESOURCE_ENERGY] === 0
            || store[C.RESOURCE_HYDROGEN] > 0
            || store[C.RESOURCE_OXYGEN] > 0
            || store[C.RESOURCE_UTRIUM] > 0
            || store[C.RESOURCE_LEMERGIUM] > 0
            || store[C.RESOURCE_KEANIUM] > 0
            || store[C.RESOURCE_ZYNTHIUM] > 0
            || store[C.RESOURCE_CATALYST] > 0
        ) {
            return
        }
        if (store[C.RESOURCE_ENERGY] === store.getUsedCapacity()) {
            return this.emptyLab()
        }
        this.makeResource(this.findLabsMineral(this.lab.store));
    };

    makeResource(resource) {
        const reaction = this.findReactionToMake(resource);
        const lab1 = this.findLabWith(reaction.reagent1, this.lab);
        if (lab1) {
            const lab2 = this.findLabWith(reaction.reagent2, this.lab);
            if (lab2) {
                return this.lab.runReaction(lab1, lab2);
            }
        }
    };

    findReactionToMake(resource) {
        for (let reagent1 in C.REACTIONS) {
            for (let reagent2 in C.REACTIONS[reagent1]) {
                if (C.REACTIONS[reagent1][reagent2] === resource) {
                    return { reagent1: reagent1, reagent2 :reagent2 }
                }
            }
        }
    };

    findLabWith(resource, lab) {
        const labs = this.lab.room.find(FIND_MY_STRUCTURES, {
            filter: l => { return l.structureType === STRUCTURE_LAB
                && (lab ? lab.pos.inRangeTo(l, 2) : true)}
        });
        for (let lab of labs) {
            if (lab.store[resource] > C.LAB_REACTION_AMOUNT) {
                return lab;
            }
        }
    };

    labsMineral(store) {
        for(let resource in store) {
            if (resource !== C.RESOURCE_ENERGY) {
                return resource;
            }
        }
    };

    emptyLab() {
        const labs = this.lab.room.find(FIND_MY_STRUCTURES, { filter: l => {
                return l.structureType === STRUCTURE_LAB
                    && l.id !== this.lab.id
            }
        });
        let lab1, lab2;
        for (let lab of labs) {
            if (!this.lab.pos.inRangeTo(lab, 2)) {
                continue;
            }
            const resource = this.labsMineral(lab.store);
            if (!resource
                || !C.REACTIONS[resource]
                || lab.store[resource] < C.LAB_REACTION_AMOUNT) {
                continue
            }
            for (let reagent in C.REACTIONS[resource]) {
                const rlab = this.findLabWith(reagent, this.lab);
                if (lab2) {
                    lab1 = lab;
                    lab2 = rlab;
                }
                let found = false;
                for (let otherLab of labs) {
                    if (this.labsMineral(otherLab.store) === reagent) {
                        found = true;
                    }
                }
                if (!found) {
                    return this.lab.runReaction(lab, rlab);
                }
            }
        }
        if (lab1 && lab2) {
            return this.lab.runReaction(lab1, lab2);
        }
    };

}

module.exports = StateLabAuto;




















































