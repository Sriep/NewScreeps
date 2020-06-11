/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const FlagOwnedRoom = require("flag_owned_room");
const StateCreep = require("./state_creep");

class StateScientistIdle extends StateCreep {
    constructor(creep) {
        super(creep);
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