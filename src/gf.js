/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const gf = {
    fatalError: function (msg) {
        console.log("Fatal error!",msg);
        console.log(Error().stack)
        if (gc.DEBUG)
            throw(msg);
    },
}

module.exports = gf;