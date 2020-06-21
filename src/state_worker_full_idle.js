/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
//const gf = require("gf");
const statePorter = require("state_porter");
const StateCreep = require("./state_creep");

class StateWorkerFullIdle  extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log(this.creep.name, "in STATE_WORKER_FULL_IDLE",this.home);
        const home = Game.rooms[this.home];
        if (home.controller.ticksToDowngrade
            < gc.EMERGENCY_DOWNGRADING_THRESHOLD) {
            this.targetId = home.controller.id;
            return this.switchToMovePos(
                home.controller.pos,
                gc.RANGE_UPGRADE,
                gc.STATE_WORKER_UPGRADE
            );
        }

        if (home.controller.level < 2) {
            this.targetId = home.controller.id;
            return this.switchToMovePos(
                home.controller.pos,
                gc.RANGE_UPGRADE,
                gc.STATE_WORKER_UPGRADE
            );
        }

        const nextSourceContainer = statePorter.findNextEnergyContainer(this.creep);
        if (nextSourceContainer) {
            this.targetId = nextSourceContainer.id;
            return this.switchToMovePos(
                nextSourceContainer.pos,
                gc.RANGE_TRANSFER,
                gc.STATE_WORKER_TRANSFER
            );
        }

        const damagedStructure = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(s)  {
                return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD;
            }
        });
        if (damagedStructure != null) {
            this.targetId = damagedStructure.id;
            return this.switchToMovePos(
                damagedStructure.pos,
                gc.RANGE_REPAIR,
                gc.STATE_WORKER_REPAIR
            );
        }

        let nextConstructionSite = this.creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (nextConstructionSite != null) {
            //console.log("nextConstructionSite", JSON.stringify(nextConstructionSite));
            this.targetId = nextConstructionSite.id;
            return this.switchToMovePos(
                nextConstructionSite.pos,
                gc.RANGE_BUILD,
                gc.STATE_WORKER_BUILD
            );
        }

        this.targetId = home.controller.id;
        return this.switchToMovePos(
            home.controller.pos,
            gc.RANGE_UPGRADE,
            gc.STATE_WORKER_UPGRADE
        );
    };
}



module.exports = StateWorkerFullIdle;