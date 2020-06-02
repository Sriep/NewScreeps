/**
 * @fileOverview screeps
 * Created by piers on 12/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const race_upgrader = {

    WWCM_COST: 300,
    WWM_COST: 250,

    bodyCounts: function (ec) {
        if (ec < this.WWCM_COST) {
            return undefined;
        }
        let Ws = 2, Ms = 1, Cs = 1;
        const wwmBlocks = Math.floor((ec -this.WWCM_COST)/this.WWM_COST);
        Ws += 2*wwmBlocks;
        Ms += wwmBlocks;
        const leftOver = (ec -this.WWCM_COST) % this.WWM_COST;
        if (leftOver >= 100) {
            Ws++
        }
        if (leftOver >= 150 ) {
            Ms++
        }
        if (leftOver >= 200 ) {
            Ms++
        }
        if (Ws + Ms + Cs > 50) {
            Ws = 32; Ms = 16; Cs = 2;
        } else if (Ws > 25) {
            Ws--; Cs++;
        }
        if (Cs === 0)  {
                gf.fatalError("bodycounts Cs are zero ec", ec)
        }
        return {"work": Ws, "carry": Cs, "move" : Ms};
    },

    boosts: [
        C.RESOURCE_CATALYZED_GHODIUM_ACID,
        C.RESOURCE_GHODIUM_ACID,
        C.RESOURCE_GHODIUM_HYDRIDE,
    ]

};

module.exports = race_upgrader;





























