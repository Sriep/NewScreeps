/**
 * @fileOverview screeps
 * Created by piers on 29/05/2020
 * @author Piers Shepperson
 */

const state = require("state");
const gc = require("gc");
const FlagRoom = require("flag_room");

const statePorter = {

    findUpgradeContainerToFill : function(room) {
        const fRoom = new FlagRoom(room.name);
        const containerPosts = fRoom.upgradeContainerPos;
        if (!containerPosts) {
            return undefined;
        }
        let bestContainer;
        let lowestEnergy = 9999;
        for (let info of containerPosts) {
            const pos = new RoomPosition(info.x, info.y, room.name);
            const container = state.findContainerAt(pos);
            if (container
                && container.store[RESOURCE_ENERGY]
                < container.store.getCapacity(RESOURCE_ENERGY) * gc.REFILL_THRESHOLD
                && container.store[RESOURCE_ENERGY] < lowestEnergy) {
                bestContainer = container;
                lowestEnergy = container.store[RESOURCE_ENERGY];
            }
        }
        return bestContainer;
    },

    findNextEnergyContainer : function (creep) {
        return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: s =>  {
                return  (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_SPAWN)
                    && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            }
        });
    },

    findNextEnergyStorage : function (creep) {
        return creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: s => {
                return (s.structureType === STRUCTURE_TOWER
                    || s.structureType === STRUCTURE_STORAGE
                    || s.structureType === STRUCTURE_LINK
                    || s.structureType === STRUCTURE_TERMINAL
                    || s.structureType === STRUCTURE_LAB)
                    && (s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY) * gc.REFILL_THRESHOLD)
            }
        })
    },

    mainResource : function (store) {
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
    },
};

module.exports = statePorter;

