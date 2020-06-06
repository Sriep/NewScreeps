/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const gf = require("gf");
const gc = require("gc");
const state = require("state");
const race = require("race");
const cache = require("cache");

function StateMovePos (creep) {
    this.type = gc.STATE_MOVE_PATH;
    this.creep = creep;
    this.m = this.creep.memory
}

StateMovePos.prototype.enact = function () {

};






module.exports = StateMovePos;




























