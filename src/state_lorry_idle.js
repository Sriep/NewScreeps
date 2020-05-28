/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const state = require("state");

function StateLorryIdle (creep) {
    this.type = gc.STATE_LORRY_IDLE;
    this.creep = creep;
}

StateLorryIdle.prototype.enact = function () {
    state.switchTo(this.creep, gc.STATE_PORTER_IDLE)
};

module.exports = StateLorryIdle;