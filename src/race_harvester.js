/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const race_harvester = {

    WWCM_COST: 300,
    WWM_COST: 250,

    body: function (ec) {
        let Ws = 2, Ms = 1, Cs = 1;
        const wwmBlocks = Math.floor((ec -this.WWCM_COST)/this.WWM_COST);
        Ws += 2*wwmBlocks;
        Ms += wwmBlocks;
        const leftOver = (ec -this.WWCM_COST) % this.WWM_COST;
        if (leftOver >= 100) Ws++
        if (leftOver >= 150 ) Ms++
        if (leftOver >= 200 ) Ms++
        if (Ws + Ms + Cs > 50) {
            Ws = 32; Ms = 16; Cs = 2;
        } else if (Ws > 25) {
            Ws--; Cs++;
        }

        let body = [];
        for (let i = 0; i < Ws; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < Ms; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < Cs; i++) {
            body.push(CARRY);
        }
        //console.log("######################## made harvester ec",ec, "bdoy", JSON.stringify(body) );

        return body;
    }
}

module.exports = race_harvester;