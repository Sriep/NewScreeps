/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */

const race_worker = {
    WORKER_SLOW_MAX_SIZE: 16,
    WORKER_FAST_MAX_SIZE: 12,
    BLOCKSIZE: 100 + 50 + 50,
    BLOCKSIZE_FAST: 100 + 50 + 50 + 50,
    BLOCKSIZE_PARTS: 3,
    WMC_COST: 200,

    bodyCounts: function (ec) {
        const parts =  Math.floor(ec/this.BLOCKSIZE);
        let  size = Math.min(parts, this.WORKER_SLOW_MAX_SIZE);
        size = Math.min(16, size);
        return {"work": size, "carry": size, "move" : size};
    }
};

module.exports = race_worker;