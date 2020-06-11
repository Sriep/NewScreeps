/**
 * @fileOverview screeps
 * Created by piers on 20/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const flag = require("flag");
const StateCreep = require("./state_creep");
const CreepMemory = require("./creep_memory");

class StateReserverIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        delete this.targetId;
        const reservers = _.filter(Game.creeps, c => {
            return CreepMemory.M(c).policyId === this.policyId
                && race.getRace(creep) === gc.RACE_RESERVER
                && CreepMemory.M(c).targetId
        });

        const colonies = policy.getGouvernerPolicy(this.home).getColonies();
        let coloniesById = {};
        for (let colony of colonies) {
            if (colony.name !== this.home) {
                colony[flag.getRoom(colony.name).getController().id] = {
                    name : colony.name,
                    ticks : 0
                }
            }
        }

        for (let reserver of reservers) {
            if (coloniesById[CreepMemory.M(reservers).targetId]) {
                coloniesById[CreepMemory.M(reservers).targetId].ticks += reserver.ticksToLive;
            }
        }
        let minTicks = 99999;
        let minId;
        for (let id of coloniesById) {
            if (coloniesById[id].ticks < minTicks) {
                minTicks = coloniesById[id].ticks;
                minId = id;
            }
        }

        this.targetId = minId;
        const fRoom = flag.getRoom(coloniesById[minId].name);
        const path = fRoom.getSPath(this.home, minId, fRoom.PathTo.Spawn, true);
        console.log(this.creep.name,"STATE_HARVESTER_IDLE path", path);
        this.switchToMoveToPath(
            path,
            fRoom.getUpgradePosts()[0],
            gc.RANGE_POST,
            gc.STATE_HARVESTER_HARVEST,
        )
    };
}



module.exports = StateReserverIdle;




















