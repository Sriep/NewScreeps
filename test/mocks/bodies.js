/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
const C = require("../../src/Constants");

const meleeRcl3 = {
    hits: 1000,
    hitsMax: 1000,
    body: [
        {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
        {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
        {"type":C.MOVE,"hits":100}, {"type":C.MOVE,"hits":100},
        {"type":C.RANGED_ATTACK,"hits":100}, {"type":C.WORK,"hits":100},
        {"type":C.ATTACK,"hits":100}, {"type":C.MOVE,"hits":100},
    ]
};

const swordsman3 = {
    hits: 1400,
    hitsMax: 1400,
    body: [
        {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
    ]
};

const sourceKeeper = {

};

const paladin3 = {
    hits: 1400,
    hitsMax: 1400,
    body: [
        {"type":C.TOUGH,"hits":100}, {"type":C.TOUGH,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.ATTACK,"hits":100},{"type":C.ATTACK,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
        {"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},{"type":C.MOVE,"hits":100},
    ]
};