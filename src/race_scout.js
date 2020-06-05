/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */

const race_scout = {
    bodyCounts: function () {
        return {"work": 0, "carry": 0, "move" : 1}
    },

    isCivilian: function() {return false},

    boosts: []
};

module.exports = race_scout;