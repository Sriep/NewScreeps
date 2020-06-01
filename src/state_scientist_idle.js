/**
 * @fileOverview screeps
 * Created by piers on 27/05/2020
 * @author Piers Shepperson
 */
const FlagOwnedRoom = require("flag_owned_room");

function StateCogIdle (creep) {
    this.type = gc.STATE_COG_IDLE;
    this.creep = creep;
    this.m = this.creep.memroy
}

StateCogIdle.prototype.enact = function () {
    const fRoom = new FlagOwnedRoom(this.home);
    const pos = gf.roomPosFromPos(fRoom.m.plan["cog"][0], this.creep.room.name);
    return state.switchToMovePos(
        this.creep,
        pos,
        gc.RANGE_TRANSFER,
        gc.STATE_COG_WITHDRAW,
    );
};

module.exports = StateCogIdle;