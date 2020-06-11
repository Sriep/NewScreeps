/**
 * @fileOverview screeps
 * Created by piers on 20/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const StateCreep = require("./state_creep");

class StateReserverReserve extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        const contoller = Game.getObjectById(this.targetId);
        const result = this.creep.reserveController(contoller);
        switch (result) {
            case OK:
                return;
            case ERR_NOT_OWNER:
                return gf.fatalError("ERR_NOT_OWNER");
            case ERR_BUSY:
                return gf.fatalError("ERR_BUSY");
            case ERR_INVALID_TARGET:
                return gf.fatalError("ERR_INVALID_TARGET");
            case ERR_NOT_IN_RANGE:
                return gf.fatalError("ERR_NOT_IN_RANGE");
            case ERR_NO_BODYPART:
                return gf.fatalError("ERR_NO_BODYPART");
            default:
                return gf.fatalError("reserveController, non valid result");
        }
    };
}



module.exports = StateReserverReserve;