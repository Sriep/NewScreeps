/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const FlagOwnedRoom = require("flag_owned_room");

class StateScientistIdle {
    constructor(creep) {
        this.type = gc.STATE_SCIENTIST_IDLE;
        this.creep = creep;
        this.m = this.creep.memory
    }

    enact() {
        const fRoom = new FlagOwnedRoom(this.home);
        const pos = gf.roomPosFromPos(fRoom.m.plan["scientist"][0], this.creep.room.name);
        return state.switchToMovePos(
            this.creep,
            pos,
            gc.RANGE_TRANSFER,
            gc.STATE_SCIENTIST_WITHDRAW,
        );
    };
}



module.exports = StateScientistIdle;