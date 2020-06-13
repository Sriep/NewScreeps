/**
 * @fileOverview screeps
 * Created by piers on 11/06/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const StateCreep = require("./state_creep");

class StateHealerIdle extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        const injured = this.creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });
        if (injured) {
            this.creep.moveTo(injured);
            this.creep.heal(injured);
            return;
        }

        const foreignOffice =  policy.getPolicyByType(gc.POLICY_COLONIAL_OFFICE);
        const roomToPatrol = foreignOffice.nextPatrolRoute(creep);
        if (roomToPatrol === this.room.name) {
            this.switchTo(gc.STATE_PATROL)
        }
        this.switchMoveToRoom(roomToPatrol, 20,  gc.STATE_HEALER_IDLE)
    };

}

module.exports = StateHealerIdle;