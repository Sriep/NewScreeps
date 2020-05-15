/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const race_porter = {
    MIN_PORTER_EC: 150,
    CCM_COST: 150,

    bodyCounts: function (ec) {
        if (ec < this.CCM_COST) {
            return undefined;
        }

        let Cs = 0, Ms = 0;
        const ccmBlocks = Math.floor(ec/this.CCM_COST);
        Cs += 2*ccmBlocks;
        Ms += ccmBlocks;
        if (Cs + Ms > 50) {
            Cs = 33; Ms = 17
        }
        return {"work": 0, "carry": Cs, "move" : Ms}
    },

    carryCapacity(ec) {
        return this.bodyCounts(ec)["carry"]*75;
    }

};

module.exports = race_porter;