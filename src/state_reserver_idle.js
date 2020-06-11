/**
 * @fileOverview screeps
 * Created by piers on 20/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const flag = require("flag");
const StateCreep = require("./state_creep");

class StateReserverIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        delete this.targetId;
        const reservers = _.filter(Game.creeps, c => {
            return c.memory.policyId === this.policyId
                && race.getRace(creep) === gc.RACE_RESERVER
                && c.memory.targetId
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
            if (coloniesById[reserver.memory.targetId]) {
                coloniesById[reserver.memory.targetId].ticks += reserver.ticksToLive;
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
        state.switchToMoveToPath(
            this.creep,
            path,
            fRoom.getUpgradePosts()[0],
            gc.RANGE_POST,
            gc.STATE_HARVESTER_HARVEST,
        )
    };
}



module.exports = StateReserverIdle;




















