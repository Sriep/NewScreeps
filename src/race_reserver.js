/**
 * @fileOverview screeps
 * Created by piers on 20/05/2020
 * @author Piers Shepperson
 */

const race_reserver = {
    bodyCounts: function (ec) {
        size = Math.floor(ec /gc.CMMMM_COST);
        return {
            "work": 0,
            "carry": 0,
            "move" : size * gc.RESERVER_MOVE_CLAIM_RATIO,
            "claim" : size
        }
    }
};

module.exports = race_reserver;