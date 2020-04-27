/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const race_worker = {

    BLOCKSIZE: 100 + 50 + 50,
    BLOCKSIZE_FAST: 100 + 50 + 50 + 50,
    BLOCKSIZE_PARTS: 3,

    body: function (size, fast) {
        let body = [];

        if (undefined === fast || !fast)
        {
            size = Math.min(16,size);
            for (let i = 0; i < size; i++) {
                body.push(CARRY);
            } // for
            for (let i = 0; i < size; i++) {
                body.push(WORK);
            } // for           
            for (let i = 0; i < size; i++) {
                body.push(MOVE);
            } // for
        } else {
            size = Math.min(12,size);
            for (let i = 0; i < size; i++) {
                body.push(CARRY);
            } // for
            for (let i = 0; i < size; i++) {
                body.push(WORK);
            } // for            
            for (let i = 0; i < size; i++) {
                body.push(MOVE);
                body.push(MOVE);
            } // for
        }
        return body;
    },

    maxSizeRoom: function(room, fast) {
        let workerBodyPartLimit;
        if (fast) {
            workerBodyPartLimit = Math.floor(room.energyCapacityAvailable/this.BLOCKSIZE_FAST);
            //console.log("fast workerBodyPartLimit", workerBodyPartLimit)
            return Math.min(workerBodyPartLimit, gc.WORKER_FAST_MAX_SIZE);
        } else {
            workerBodyPartLimit =  Math.floor(room.energyCapacityAvailable/this.BLOCKSIZE);
            //console.log("slow workerBodyPartLimit", workerBodyPartLimit, room.energyCapacityAvailable, this.BLOCKSIZE)
            return Math.min(workerBodyPartLimit, gc.WORKER_SLOW_MAX_SIZE);
        }
    }

}

module.exports = race_worker;