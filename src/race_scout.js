/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */

const race_scout = {
    MIN_PORTER_EC: 150,
    CCM_COST: 150,

    bodyCounts: function (ec) {
        return {"work": 0, "carry": 0, "move" : 1}
    }
}

module.exports = race_scout;