/**
 * @fileOverview screeps
 * Created by piers on 28/04/2020
 * @author Piers Shepperson
 */

const race_porter = {

    CCM_COST: 150,

    body: function (ec) {
        let Cs = 0, Ms = 0;
        const ccmBlocks = Math.floor(ec/this.CCM_COST);
        Cs += 2*ccmBlocks;
        Ms += ccmBlocks;
        if (Cs + Ms > 50) {
            Cs = 33; Ms = 17
        }
        let body = [];
        for (let i = 0; i < Cs; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < Ms; i++) {
            body.push(MOVE);
        }
        return body
    },

    bodyCounts: function (ec) {
        let Cs = 0, Ms = 0;
        const ccmBlocks = Math.floor(ec/this.CCM_COST);
        Cs += 2*ccmBlocks;
        Ms += ccmBlocks;
        if (Cs + Ms > 50) {
            Cs = 33; Ms = 17
        }
        return {WORK: 0, CARRY: Cs, MOVE : Ms}
    }
}

module.exports = race_porter;